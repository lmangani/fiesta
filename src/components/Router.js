import React from "react";
import { HashRouter, Route, Switch, createRoot, useSearchParams } from "react-router-dom";
import Host from "./Host";
import Party from "./Party";

const queryParameters = new URLSearchParams(window.location.search)
const room = queryParameters.get("room")

// Wrapper component for Party that receives 'room' as a URL parameter
const PartyWithRoom = () => {
  return <Party host_id={room} />;
};

const Router = () => (
  <HashRouter>
    <Switch>
      <Route exact path="/" component={Host} />
      <Route exact path="/party/?" component={PartyWithRoom} />
      <Route exact path="/:host_id" component={Party} />
    </Switch>
  </HashRouter>
);
export default Router;
