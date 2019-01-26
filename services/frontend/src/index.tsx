import * as React from "react";
import * as ReactDOM from "react-dom";
import App from "./App";
import * as serviceWorker from "./serviceWorker";

import { BrowserRouter as Router } from "react-router-dom";

const application = (
  <Router>
    <App />
  </Router>
);

const root = document.querySelector("#root");

if (root && root.hasChildNodes()) {
  ReactDOM.hydrate(application, root);
} else {
  ReactDOM.render(application, document.querySelector("#root"));
  serviceWorker.unregister();
}
