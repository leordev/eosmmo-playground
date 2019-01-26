#!/usr/bin/env bash
EOSIO_ACCOUNT_PRIVATE_KEY="5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3"
EOSIO_ACCOUNT_PUBLIC_KEY="EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV"

EOSMMO_ACCOUNT_PRIVATE_OWNER_KEY="5KNtiQbanVwWvnaUu8L7U4QxtrVXbLSvQDJW681njcSrxncs33n"
EOSMMO_ACCOUNT_PUBLIC_OWNER_KEY="EOS6KK4CZpN8qpEfMRk49yQY1vAWRE6VAHtauSCRZP5hp8pcHUD7V"

EOSMMO_ACCOUNT_PRIVATE_ACTIVE_KEY="5J2tFy97YHdi8tqMA1o9tyPnNn2qqXvUazYdyXnxZtP9RA2J1Vu"
EOSMMO_ACCOUNT_PUBLIC_ACTIVE_KEY="EOS6GmTt1ikiC6wPMhqBLQFtMw2UqZSbbi2WVTqyG1UtiGhcpko2R"

USER_ACCOUNT_PRIVATE_ACTIVE_KEY="5JNYkjyXabdZ7cpi2ma5XxvHEofUyiBmcV2yHj9naG27SwVzpeb"
USER_ACCOUNT_PUBLIC_ACTIVE_KEY="EOS8CxbECxboaFmgocffE3VyH7SUpX56TGt3kXnwwgWSsWQrreJXE"

EOSIO_TOKEN_PRIVATE_OWNER_KEY="5JD3R4Vgsau8VedAcBYPgWPLPsBtsEbHVJ7SHmQYMpSD7Q3kjko"
EOSIO_TOKEN_PUBLIC_OWNER_KEY="EOS59BVnmXAow9r8UwTG6PQwupFxhbRjL8y39Dg1C52Ys1FRkpTim"

EOSIO_TOKEN_PRIVATE_ACTIVE_KEY="5JD3R4Vgsau8VedAcBYPgWPLPsBtsEbHVJ7SHmQYMpSD7Q3kjko"
EOSIO_TOKEN_PUBLIC_ACTIVE_KEY="EOS59BVnmXAow9r8UwTG6PQwupFxhbRjL8y39Dg1C52Ys1FRkpTim"

ROOT_DIR="/opt/eosio"
WALLET_DIR="$ROOT_DIR/wallet/"
CLEOS="$ROOT_DIR/bin/cleos --wallet-url http://127.0.0.1:8900"
SCRIPTS_DIR="$ROOT_DIR/bin/contracts/scripts"
CONFIG_DIR="$ROOT_DIR/bin/config-dir"
CONTRACTS_DIR="/contracts/"

function start_wallet {
	echo "Starting the wallet"
	rm -rf $WALLET_DIR
	mkdir -p $WALLET_DIR
	nohup keosd --unlock-timeout 999999999 --wallet-dir $WALLET_DIR --http-server-address 127.0.0.1:8900 2>&1 &
	sleep 1s
	wallet_password=$($CLEOS wallet create --to-console | awk 'FNR > 3 { print $1 }' | tr -d '"')
	echo $wallet_password > "$CONFIG_DIR"/keys/default_wallet_password.txt

	$CLEOS wallet import --private-key $EOSIO_ACCOUNT_PRIVATE_KEY
}

function create_system_accounts {
	echo "Creating system accounts"
	SYSTEM_ACCOUNTS=(eosio.bpay eosio.msig eosio.names eosio.ram eosio.ramfee eosio.saving eosio.stake eosio.token eosio.vpay)
	for ACCOUNT in ${SYSTEM_ACCOUNTS[*]}; do
		echo "Creating system account $ACCOUNT"
		$CLEOS create account eosio $ACCOUNT $EOSIO_ACCOUNT_PUBLIC_KEY
	done
}

function deploy_system_account_contracts {
	echo "Deploying system account contracts"
	$CLEOS set contract eosio.token $CONTRACTS_DIR/eosio.token/
	$CLEOS set contract eosio.msig $CONTRACTS_DIR/eosio.msig/
}

function allocate_sys_tokens {
	echo "Allocating SYS tokens for staking bandwidth"
	$CLEOS push action eosio.token create '["eosio", "10000000000.0000 SYS"]' -p eosio.token
	$CLEOS push action eosio.token issue '["eosio", "5000000000.0000 SYS", "Half of available supply"]' -p eosio
}

function deploy_system_contract {
	echo "Deploying the system contract"
	$CLEOS set contract eosio $CONTRACTS_DIR/eosio.system eosio.system.wasm eosio.system.abi
	$CLEOS push action eosio setpriv '["eosio.msig", 1]' -p eosio@active
}

function import_token_private_keys {
	echo "Importing the eosio.token private keys"
	$CLEOS wallet import --private-key $EOSIO_TOKEN_PRIVATE_OWNER_KEY
	$CLEOS wallet import --private-key $EOSIO_TOKEN_PRIVATE_ACTIVE_KEY
}

# move into the executable directory
cd /opt/eosio/bin/

# Only create contract if wallet doesn't exist
mkdir -p "$CONFIG_DIR"/keys

# Sleep for 2 to allow time 4 blocks to be created so we have blocks to reference when sending transactions
sleep 2s
echo "Creating accounts and deploying wallets"

start_wallet
create_system_accounts
deploy_system_account_contracts
allocate_sys_tokens
deploy_system_contract
import_token_private_keys

$CLEOS wallet import --private-key $EOSMMO_ACCOUNT_PRIVATE_OWNER_KEY
$CLEOS wallet import --private-key $EOSMMO_ACCOUNT_PRIVATE_ACTIVE_KEY

$CLEOS system newaccount eosio --transfer eosmmoserver $EOSMMO_ACCOUNT_PUBLIC_OWNER_KEY $EOSMMO_ACCOUNT_PUBLIC_ACTIVE_KEY --stake-net "100000.0000 SYS" --stake-cpu "100000.0000 SYS" --buy-ram "100000.000 SYS"
$CLEOS transfer eosio eosmmoserver "1000000.0000 SYS"

$CLEOS set contract eosmmoserver /opt/application/eosmmoserver

$CLEOS system newaccount eosio dummyuser $USER_ACCOUNT_PUBLIC_ACTIVE_KEY $USER_ACCOUNT_PUBLIC_ACTIVE_KEY --stake-net "100000.0000 SYS" --stake-cpu "100000.0000 SYS" --buy-ram "100000.000 SYS"

echo "All done initializing the block chain"
