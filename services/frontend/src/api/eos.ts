// import { JsonRpc } from "eosjs";
import { JsonRpc } from "eosjs";

export const CONTRACT_NAME = "eosmmoserver";
export const CHAIN_PROTOCOL = "https";
export const CHAIN_HOST = "0e623b35.ngrok.io" || "localhost";
export const CHAIN_PORT = 443 || 8888;
export const CHAIN_ID =
  "cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f";
export const CHAIN_URL = `${CHAIN_PROTOCOL}://${CHAIN_HOST}:${CHAIN_PORT}`;
export const EOS_RPC = new JsonRpc(CHAIN_URL);

export interface ScatterAccount {
  authority: string;
  blockchain: string;
  name: string;
  isHardware: boolean;
  publicKey: string;
}

const submitTrx = async (
  api: any,
  actor: string,
  permission: string,
  action: string,
  data: any,
  contract = CONTRACT_NAME
) => {
  const preTrx = {
    actions: [
      {
        data,
        account: contract,
        name: action,
        authorization: [
          {
            actor,
            permission
          }
        ]
      }
    ]
  };
  console.info(preTrx);
  return await api.transact(
    { ...preTrx },
    {
      blocksBehind: 3,
      expireSeconds: 300
    }
  );
};

export const trxOpenAccount = async (
  api: any,
  account: ScatterAccount,
  playername: string
) => {
  return await submitTrx(api, account.name, account.authority, "openaccount", {
    playername,
    owner: account.name,
    chartype: 1
  });
};

export const trxLogin = async (
  api: any,
  account: ScatterAccount,
  session: string
) => {
  return await submitTrx(api, account.name, account.authority, "login", {
    session,
    owner: account.name
  });
};

export const loadAccount = async (account: string) => {
  const res = await EOS_RPC.get_table_rows({
    scope: CONTRACT_NAME,
    code: CONTRACT_NAME,
    table: "accounts",
    json: true,
    lower_bound: account,
    limit: 1
  });

  if (res.rows && res.rows.length) {
    const acc = res.rows[0];
    if (acc.owner === account) {
      return acc;
    }
  }

  return null;
};
