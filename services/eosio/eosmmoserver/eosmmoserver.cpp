#include <eosiolib/eosio.hpp>
#include <eosiolib/asset.hpp>
#include <string>

using namespace eosio;
using std::string;
using std::vector;

CONTRACT eosmmoserver : public eosio::contract
{
public:
  using contract::contract;

  const uint64_t initial_gold = 100;
  const symbol gold = symbol{"GOLD", 0};

  eosmmoserver(name receiver, name code, datastream<const char *> ds)
      : contract(receiver, code, ds),
        _accounts(receiver, receiver.value),
        _equips(receiver, receiver.value)
  {
  }

  TABLE equip
  {
    uint64_t id;
    name owner;
    symbol item;
    uint64_t experience;

    uint64_t primary_key() const { return id; }
  };
  typedef eosio::multi_index<"equips"_n, equip> equips;
  equips _equips;

  struct st_inventory
  {
    symbol item;
    int32_t quantity;
    uint64_t id;
  };

  TABLE account
  {
    name owner;
    string playername;
    uint32_t chartype;

    uint64_t experience = 0;
    uint32_t str = 5;
    uint32_t agi = 5;
    uint32_t intl = 5;

    uint32_t world = 0;
    vector<uint32_t> location = {0, 0, 0};

    asset gold;

    vector<uint64_t> quests = {};

    vector<st_inventory> inventory = {};
    vector<uint64_t> activeeqs = {};

    vector<st_inventory> bankinv = {};
    vector<uint64_t> bankeqs = {};

    uint64_t primary_key() const { return owner.value; }
  };
  typedef eosio::multi_index<"accounts"_n, account> accounts;
  accounts _accounts;

  void add_item(vector<st_inventory> inventory, uint64_t pos, st_inventory item)
  {
    eosio_assert(item.item.is_valid(), "invalid item");
    eosio_assert(item.quantity > 0, "invalid quantity to add");

    if (pos == 0 || pos >= inventory.size())
    {
      inventory.emplace_back(item);
    }
    else
    {
      auto current_item = inventory[pos - 1];
      if (item.item == current_item.item && item.id == current_item.id)
      {
        current_item.quantity += item.quantity;
      }
      else
      {
        inventory.emplace(inventory.begin() + pos, item);
      }
    }
  }

  void sub_item(vector<st_inventory> inventory, uint64_t pos, st_inventory item)
  {
    eosio_assert(inventory.size() - 1 >= pos, "invalid inventory item");
    eosio_assert(item.quantity > 0, "invalid quantity");
    eosio_assert(item.item.is_valid(), "invalid item");

    auto sub_item = inventory[pos];
    eosio_assert(item.item == sub_item.item && item.id == sub_item.id, "item position does not match");
    sub_item.quantity = sub_item.quantity - item.quantity;
    eosio_assert(sub_item.quantity >= 0, "not enough balance");

    if (item.quantity == 0)
    {
      inventory.erase(inventory.begin() + pos);
    }
  }

  ACTION openaccount(name owner, string playername, uint32_t chartype)
  {
    require_auth(owner);

    auto aitr = _accounts.find(owner.value);
    eosio_assert(aitr == _accounts.end(), "Account already open");

    _accounts.emplace(_self, [&](account &a) {
      a.owner = owner;
      a.chartype = chartype;
      a.playername = playername;
      a.gold = asset(initial_gold, gold);
    });
  }

  ACTION login(name owner, string session)
  {
    require_auth(owner);
    auto aitr = _accounts.find(owner.value);
    eosio_assert(aitr != _accounts.end(), "Invalid Account");
  }

  ACTION logout(name owner, string session)
  {
    require_auth(_self);
    auto aitr = _accounts.find(owner.value);
    eosio_assert(aitr != _accounts.end(), "Invalid Account");
  }

  ACTION addplayerxp(name owner, uint64_t experience, string memo)
  {
    require_auth(_self);

    auto aitr = _accounts.find(owner.value);
    eosio_assert(aitr != _accounts.end(), "Invalid account");

    _accounts.modify(aitr, _self, [&](account &r) {
      r.experience = r.experience + experience;
    });
  }

  ACTION updlocation(name owner, uint32_t world, vector<uint32_t> location)
  {
    require_auth(_self);

    auto aitr = _accounts.find(owner.value);
    eosio_assert(aitr != _accounts.end(), "Invalid account");

    _accounts.modify(aitr, _self, [&](account &r) {
      r.world = world;
      r.location = location;
    });
  }

  ACTION setplayeratr(name owner, uint32_t str, uint32_t agi, uint32_t intl, string memo)
  {
    require_auth(_self);

    // TODO: validate attrs per exp/level

    auto aitr = _accounts.find(owner.value);
    eosio_assert(aitr != _accounts.end(), "Invalid account");

    _accounts.modify(aitr, _self, [&](account &r) {
      r.str = str;
      r.agi = agi;
      r.intl = intl;
    });
  }

  ACTION goldissue(name user, asset gold, string memo)
  {
    require_auth(_self);

    eosio_assert(gold.amount > 0, "quantity must be positive");
    eosio_assert(gold.symbol.is_valid(), "invalid gold");

    auto itr = _accounts.find(user.value);
    eosio_assert(itr != _accounts.end(), "Invalid user account");

    _accounts.modify(itr, _self, [&](account &r) {
      r.gold.amount += gold.amount;
    });
  }

  ACTION itemissue(name user, uint64_t pos, st_inventory item, string memo)
  {
    require_auth(_self);

    auto itr = _accounts.find(user.value);
    eosio_assert(itr != _accounts.end(), "Invalid user account");

    _accounts.modify(itr, _self, [&](account &r) {
      add_item(r.inventory, pos, item);
    });
  }

  ACTION itemdestroy(name user, uint64_t pos, st_inventory item, string memo)
  {
    require_auth(_self);

    auto itr = _accounts.find(user.value);
    eosio_assert(itr != _accounts.end(), "Invalid user account");

    if (item.id > 0)
    {
      auto eitr = _equips.find(item.id);
      eosio_assert(eitr != _equips.end(), "Invalid equip id");
      eosio_assert(eitr->owner == user, "user does not own item");
      _equips.erase(eitr);
    }

    _accounts.modify(itr, _self, [&](account &r) {
      sub_item(r.inventory, pos, item);
    });
  }

  ACTION equipissue(name user, uint64_t id, symbol item, uint64_t experience, string memo)
  {
    require_auth(_self);

    eosio_assert(item.is_valid(), "Invalid item issue");

    auto itr = _equips.find(id);
    eosio_assert(itr == _equips.end(), "equip id already exists");

    _equips.emplace(_self, [&](equip &r) {
      r.id = id;
      r.owner = user;
      r.item = item;
      r.experience = experience;
    });
  }

  ACTION playerequip(name user, uint64_t id)
  {
    require_auth(_self);

    auto eitr = _equips.find(id);
    eosio_assert(eitr != _equips.end(), "invalid equip");
    eosio_assert(eitr->owner == user, "equip not owned");

    auto aitr = _accounts.find(user.value);
    eosio_assert(aitr != _accounts.end(), "Invalid account");

    bool is_carrying = false;
    for (auto &item : aitr->inventory)
    {
      if (item.id == id)
      {
        is_carrying = true;
        break;
      }
    }
    eosio_assert(is_carrying, "user is not carrying equip");

    _accounts.modify(aitr, _self, [&](account &r) {
      int active_equip = 0;
      bool is_active = false;
      for (auto &active_equip : r.activeeqs)
      {
        if (active_equip == id)
        {
          is_active = true;
          break;
        }
        active_equip++;
      }

      if (is_active)
      {
        r.activeeqs.erase(r.activeeqs.begin() + active_equip);
      }
      else
      {
        r.activeeqs.emplace_back(id);
      }
    });
  }

  ACTION addequipxp(uint64_t id, uint64_t exp, string memo)
  {
    require_auth(_self);

    auto eitr = _equips.find(id);
    eosio_assert(eitr != _equips.end(), "Invalid equip");

    _equips.modify(eitr, _self, [&](equip &r) {
      r.experience = r.experience + exp;
    });
  }
};

EOSIO_DISPATCH(eosmmoserver, (openaccount)(login)(logout)(addplayerxp)(updlocation)(setplayeratr)(goldissue)(itemissue)(itemdestroy)(equipissue)(playerequip)(addequipxp))