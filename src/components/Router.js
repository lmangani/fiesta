import React from "react";
import { HashRouter, Route, Switch } from "react-router-dom";
import Host from "./Host";
import Party from "./Party";
const Router = () => (
  <HashRouter>
    <Switch>
      <Route exact path="/" component={Host} />
      <Route exact path="/:host_id" component={Party} />
    </Switch>
  </HashRouter>
);
export default Router;
