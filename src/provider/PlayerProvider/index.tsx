import React from "react";
import bonjour from "bonjour";

interface IChromecast {
  ip: string;
  name: string;
  type: string;
}

interface IPlayerContext {
  chromecasts: IChromecast[];
  logMessages: string[];
  addLogMessage: (message: string) => void;
}

export const PlayerContext = React.createContext<IPlayerContext>({
  chromecasts: [],
  logMessages: [],
  addLogMessage: () => {}
});

const PlayerProvider = ({ children }: any) => {
  const [chromecasts, setChromecasts] = React.useState<IChromecast[]>([]);
  const [logMessages, setLogMessages] = React.useState<string[]>([]);

  const addLogMessage = React.useCallback((message: string) => {
    setLogMessages(logMessages => [...logMessages, message]);
  }, []);

  React.useEffect(() => {
    addLogMessage("Looking for chromecasts");
    bonjour().find({ type: "googlecast" }, service => {
      addLogMessage(
        `Found chromecast: ${JSON.stringify(
          { ...service, rawTxt: undefined },
          null,
          "\t"
        )}`
      );
      setChromecasts(chromeCasts => [
        ...chromeCasts,
        {
          ip: service.addresses[0],
          name: service.txt.fn,
          type: service.txt.md
        }
      ]);
    });
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        chromecasts,
        logMessages,
        addLogMessage
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export default PlayerProvider;
