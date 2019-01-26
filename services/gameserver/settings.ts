import dotenv from "dotenv";

dotenv.config({ path: `${__dirname}/.env` });

const port = process.env.PORT || 8000;
const dbConfig = {
  user: process.env.DB_USER || "docker",
  password: process.env.DB_PASSWORD || "docker",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || "demux",
  schema: process.env.DB_SCHEMA || "demux"
};

const eosService = {
  pk: "5JhTPDSe9ugHomFnhMgAdzzE2HniuR8rG3SyzzqvQrgJNPC4685",
  port: 5051,
  blockchainUrl: "https://96357477.ngrok.io",
  account: "eosmmoserver",
  permission: "active"
};

export { port, dbConfig, eosService };
