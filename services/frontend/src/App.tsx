import * as React from "react";
import { Helmet } from "react-helmet";
import { Route, Switch } from "react-router";

import "bulma/css/bulma.css";
import "./styles/index.css";
import AuthSession from "./modules/AuthSession";

import ScatterJS from "scatterjs-core";
import ScatterEOS from "scatterjs-plugin-eosjs2";

// eosjs2
import { Api } from "eosjs";
import {
  CHAIN_PROTOCOL,
  CHAIN_HOST,
  CHAIN_PORT,
  CHAIN_ID,
  EOS_RPC
} from "./api/eos";
import AccountSummary from "./modules/AccountSummary";

const network = {
  blockchain: "eos",
  protocol: CHAIN_PROTOCOL,
  host: CHAIN_HOST,
  port: CHAIN_PORT,
  chainId: CHAIN_ID
};
const rpc = EOS_RPC;

let api = null as any;

ScatterJS.plugins(new ScatterEOS());

const loadScatter = async (setScatter: any) => {
  try {
    const connected = await ScatterJS.scatter.connect("EOSMMO");
    if (connected) {
      setScatter(ScatterJS.scatter);
      (window as any).ScatterJS = null;
      api = new Api({
        rpc,
        signatureProvider: ScatterJS.scatter.eosHook(network)
      });
    }
  } catch (e) {
    console.error("Invalid Scatter", e);
    alert("Please Install and Start Scatter");
  }
};

const loadIdentity = async (scatter: any, setAccount: any) => {
  try {
    const identity = await scatter.getIdentity({
      accounts: [network]
    });

    if (!identity || !identity.accounts || !identity.accounts.length) {
      throw "Invalid Identity for current Chain";
    }

    if (identity) {
      setAccount(identity.accounts[0]);
    }
  } catch (e) {
    console.error("invalid identity", e);
    alert("Invalid Scatter Identity");
  }
};

const App = () => {
  const [account, setAccount] = React.useState(null as any);
  const [scatter, setScatter] = React.useState(null as any);

  React.useEffect(() => {
    loadScatter(setScatter);
  }, []);

  const doLoadIdentity = () => loadIdentity(scatter, setAccount);
  React.useEffect(
    () => {
      if (scatter) {
        doLoadIdentity();
      } else {
        setAccount(null);
      }
    },
    [scatter]
  );

  const doLogout = () => {
    scatter.forgetIdentity();
    setAccount(null);
  };

  return (
    <div>
      <Helmet
        title="EOS MMO UI"
        meta={[{ name: "description", content: "EOS MMO UI Panel" }]}
      />

      <div>
        <h1>EOS MMO Panel</h1>
        {account && account.name ? (
          <div>
            Welcome, {account.name}!{" "}
            <button
              className="button is-danger is-pulled-right"
              onClick={doLogout}
            >
              Logout
            </button>
          </div>
        ) : scatter ? (
          <button className="button is-info" onClick={doLoadIdentity}>
            Sign with Scatter
          </button>
        ) : (
          "Please install Scatter"
        )}
      </div>

      <Switch>
        {account &&
          account.name && (
            <Route
              path="/"
              exact
              render={props => (
                <AccountSummary {...props} api={api} account={account} />
              )}
            />
          )}
        <Route
          path="/auth/:sessionId"
          render={props => (
            <AuthSession {...props} api={api} account={account} />
          )}
        />
      </Switch>
    </div>
  );
};

export default App;
