#include <eosiolib/eosio.hpp>
#include <eosiolib/asset.hpp>
#include <string>

using namespace eosio;
using std::string;
using std::vector;

CONTRACT eosmcserver : public eosio::contract
{
public:
  using contract::contract;

  eosmcserver(name receiver, name code, datastream<const char *> ds)
      : contract(receiver, code, ds),
        _accounts(receiver, receiver.value)
  {
  }

  TABLE symbolinfo
  {
    uint64_t global_id;
    string symbol;
  };
  typedef eosio::multi_index<"symbolinfo"_n, symbolinfo> t_symbolinfo;
  t_symbolinfo tb_symbolinfo;

  TABLE tokenstats
  {
    name token_name;
    uint64_t global_id;
    name issuer;
    string symbol;
    name category;
    bool fungible;
    bool burnable;
    bool transferable;
    double current_supply;
    uint64_t max_supply;

    uint64_t primary_key() const { return token_name.value; }
  };
  typedef eosio::multi_index<"tokenstats"_n, tokenstats> t_tokenstats;
  t_tokenstats tb_tokenstats;

  struct st_inventory
  {
    uint64_t id;
    int32_t quantity;
    string nbt;
  };

  TABLE account
  {
    name owner;
    string playername;

    uint64_t experience = 0;

    vector<uint64_t> achievements = {};

    vector<st_inventory> bankinv = {};

    uint64_t primary_key() const { return owner.value; }

    void add_item(st_inventory item)
    {
      check(item.id > 0, "invalid item");
      check(item.quantity > 0, "invalid quantity to add");

      bool newItem = true;
      for (st_inventory &existingItem : bankinv)
      {
        if (existingItem.id == item.id)
        {
          newItem = false;
          existingItem.quantity += item.quantity;
          break;
        }
      }

      if (newItem)
      {
        bankinv.emplace_back(item);
      }
    }
  };
  typedef eosio::multi_index<"accounts"_n, account> accounts;
  accounts _accounts;

  ACTION openaccount(name owner, string playername)
  {
    require_auth(owner);

    auto aitr = _accounts.find(owner.value);
    eosio_assert(aitr == _accounts.end(), "Account already open");

    _accounts.emplace(_self, [&](account &a) {
      a.owner = owner;
      a.playername = playername;
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

  ACTION batchdeposit(name user, vector<st_inventory> batch, string memo)
  {
    require_auth(_self);

    auto itr = _accounts.find(user.value);
    eosio_assert(itr != _accounts.end(), "Invalid user account");

    _accounts.modify(itr, _self, [&](account &r) {
      for (st_inventory item : batch)
      {
        r.add_item(item);
      }
    });
  }
};

EOSIO_DISPATCH(eosmcserver, (openaccount)(login)(logout)(batchdeposit))