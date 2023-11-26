import React from "react";
import ReactDOM from "react-dom";
import "./App.scss";
import Router from "./components/Router";
import * as serviceWorker from "./serviceWorker";
import { createRoot } from 'react-dom/client';

const container = document.getElementById('root');
const root = createRoot(container); // createRoot(container!) if you use TypeScript
root.render(<React.StrictMode>
    <Router />
  </React.StrictMode>);


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
