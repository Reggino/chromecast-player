import * as React from "react";
import FormPanel from "./FormPanel";
import LogPanel from "./LogPanel";

interface IChromeCast {
  ip: string;
  name: string;
  type: string;
}

const Main = (): React.ReactElement => {
  return (
    <div style={{ display: "flex", height: '100%' }}>
      <FormPanel />
      <LogPanel />
    </div>
  );
};

export default Main;
