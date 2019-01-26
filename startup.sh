cd services/eosio/eosmmoserver
eosio-cpp -abigen eosmmoserver.cpp -o eosmmoserver.wasm
cd ../../..
docker-compose up -d
sleep 5s
docker-compose exec testnet /opt/application/init_chain.sh