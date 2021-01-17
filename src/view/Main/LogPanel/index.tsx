import * as React from "react";
import { PlayerContext } from "../../../provider/PlayerProvider";

const LogPanel = (): React.ReactElement => {
  const { logMessages } = React.useContext(PlayerContext);
    const messagesEndRef = React.useRef(null);

    React.useEffect(() => {
    if (!messagesEndRef.current) {
      return;
    }
    (messagesEndRef.current as any).scrollIntoView({ behavior: "smooth" });
  }, [logMessages]);
  return (
    <div
      style={{
        flex: 1,
        border: "1px solid black",
        margin: 10,
        padding: 10,
        overflow: "auto"
      }}
    >
      <h2>Log</h2>
      <pre>{logMessages.join("\n")}</pre>
      <div ref={messagesEndRef} />
    </div>
  );
};

export default LogPanel;
