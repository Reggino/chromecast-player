import * as React from "react";
import FormPanel from "./FormPanel";
import LogPanel from "./LogPanel";
import bonjour from "bonjour";

const Main = (): React.ReactElement => {
  React.useEffect(() => {
    console.log("Looking for googlecast");
    bonjour().find({ type: "googlecast" }, function(service) {
      console.log("Found server:", service);
    });
  }, []);

  return (
    <div style={{ display: "flex" }}>
      <FormPanel />
      <LogPanel />
    </div>
  );
};

export default Main;
