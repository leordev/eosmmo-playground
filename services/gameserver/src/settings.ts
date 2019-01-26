export const API_PORT = 5000;

export const MONGO_DB_CONFIG = {
  host: process.env.MONGODB_HOST || "mongodb://127.0.0.1:27017",
  dbName: process.env.MONGODB_DB_NAME || "testnet"
};

export const CHAIN_INIT_BLOCK = Number(process.env.CHAIN_INIT_BLOCK || 10);

export const CONTRACT_ACCOUNT = process.env.CONTRACT_ACCOUNT || "eosmmoserver";

export const GS_TCP_HOST = "127.0.0.1";
export const GS_TCP_PORT = 5095;
