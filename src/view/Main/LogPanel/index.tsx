import * as React from "react";

const LogPanel = (): React.ReactElement => {
  return (
    <div style={{ border: "1px solid black", margin: 10, padding: 10 }}>
      <h2>Log</h2>
      <pre>Interface initialzed</pre>
    </div>
  );
};

export default LogPanel;
