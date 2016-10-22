import App from "./components/App";
import * as React from "react";
import * as ReactDOM from "react-dom";
import './main.scss';

// append main element to body
const mainElement = document.createElement("div");
document.getElementsByTagName("body")[0].appendChild(mainElement);

ReactDOM.render(
  <App />,
  mainElement
)
