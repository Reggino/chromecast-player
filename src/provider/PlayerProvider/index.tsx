import React from "react";
import bonjour from "bonjour";

interface IChromecast {
  ip: string;
  name: string;
  type: string;
}

interface IPlayerContext {
  addLogMessage: (message: string) => void;
  chromecast?: IChromecast;
  chromecasts: IChromecast[];
  logMessages: string[];
  subtitlesPath?: string;
  videoPath?: string;
  setChromecast: (chromecast?: IChromecast) => void;
  setSubtitlesPath: (subtitlesPath: string) => void;
  setVideoPath: (videoPath: string) => void;
}

const emptyFn = () => {
  /* */
};

export const PlayerContext = React.createContext<IPlayerContext>({
  chromecasts: [],
  logMessages: [],
  addLogMessage: emptyFn,
  setChromecast: emptyFn,
  setSubtitlesPath: emptyFn,
  setVideoPath: emptyFn,
});

const PlayerProvider = ({ children }: any) => {
  const [chromecast, setChromecast] = React.useState<IChromecast>();
  const [chromecasts, setChromecasts] = React.useState<IChromecast[]>([]);
  const [logMessages, setLogMessages] = React.useState<string[]>([]);
  const [subtitlesPath, setSubtitlesPath] = React.useState<string>();
  const [videoPath, setVideoPath] = React.useState<string>();

  const addLogMessage = React.useCallback((message: string) => {
    setLogMessages((logMessages) => [...logMessages, message]);
  }, []);

  React.useEffect(() => {
    addLogMessage("Looking for chromecasts");
    bonjour().find({ type: "googlecast" }, (service) => {
      addLogMessage(
        `Found chromecast: ${JSON.stringify(
          { ...service, rawTxt: undefined },
          null,
          "\t"
        )}`
      );
      const newChromecast = {
        ip: service.addresses[0],
        name: service.txt.fn,
        type: service.txt.md,
      };
      setChromecasts((chromeCasts) => [...chromeCasts, newChromecast]);
      setChromecast((oldChromecast) =>
        oldChromecast ? oldChromecast : newChromecast
      );
    });
  }, [addLogMessage]);

  return (
    <PlayerContext.Provider
      value={{
        addLogMessage,
        chromecast,
        chromecasts,
        logMessages,
        setChromecast,
        setSubtitlesPath,
        setVideoPath,
        subtitlesPath,
        videoPath,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export default PlayerProvider;
