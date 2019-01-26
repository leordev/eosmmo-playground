import * as React from "react";
import { Helmet } from "react-helmet";
import { Route, Switch } from "react-router";

import "bulma/css/bulma.css";
import "./styles/index.css";
import AuthSession from "./modules/AuthSession";
import DefaultPage from "./modules/DefaultPage";

const App = () => (
  <div>
    <Helmet
      title="EOS MMO UI"
      meta={[{ name: "description", content: "EOS MMO UI Panel" }]}
    />
    <Switch>
      <Route path="/auth/:sessionId" component={AuthSession} />
      <Route path="/" component={DefaultPage} />
    </Switch>
  </div>
);

export default App;
