import * as React from "react";
import * as ReactDOM from "react-dom";
import Main from "./view/Main";
import PlayerProvider from "./provider/PlayerProvider";

function render() {
  ReactDOM.render(
    <PlayerProvider>
      <Main />
    </PlayerProvider>,
    document.getElementById("app")
  );
}

render();
