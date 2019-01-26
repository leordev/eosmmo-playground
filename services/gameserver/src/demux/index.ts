import { BaseActionWatcher, Block } from "demux";
import { MongoActionReader } from "demux-eos";
import ObjectActionHandler from "./ObjectActionHandler";
import {
  MONGO_DB_CONFIG,
  CHAIN_INIT_BLOCK,
  CONTRACT_ACCOUNT
} from "../settings";

const loggerEffect = (payload: any, block: Block) => {
  console.info(
    "\n Login Effect detected: \n >>> Payload:",
    payload,
    "\n\n >>> Block:",
    block
  );
};

const loginSession = (payload: any) => {};

const effects = [
  {
    actionType: `${CONTRACT_ACCOUNT}::openaccount`,
    run: loggerEffect
  },
  {
    actionType: `${CONTRACT_ACCOUNT}::login`,
    run: loggerEffect
  },
  {
    actionType: `${CONTRACT_ACCOUNT}::login`,
    run: loginSession
  }
];
const updaters = [] as any[];

const init = async () => {
  const handlerVersion = {
    updaters,
    effects,
    versionName: "v1"
  };

  console.info(handlerVersion);

  const actionHandler = new ObjectActionHandler([handlerVersion]);

  const actionReader = new MongoActionReader(
    MONGO_DB_CONFIG.host,
    CHAIN_INIT_BLOCK,
    false,
    600,
    MONGO_DB_CONFIG.dbName
  );

  await actionReader.initialize();

  const actionWatcher = new BaseActionWatcher(actionReader, actionHandler, 250);

  actionWatcher.watch();
};

console.info(">>>>> Initializing DEMUX <<<<<");
init();
