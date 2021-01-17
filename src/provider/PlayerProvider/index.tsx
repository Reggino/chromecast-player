import React from "react";
import bonjour from "bonjour";
import getPort from "get-port";
import { mediaServerApp, setMediaServerVideoPath } from "./mediaServer";

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
  mediaServerPort?: number;
  videoPath?: string;
  setChromecast: (chromecast: IChromecast) => void;
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
  setVideoPath: emptyFn
});

const PlayerProvider = ({ children }: any) => {
  const [chromecast, setChromecast] = React.useState<IChromecast>();
  const [chromecasts, setChromecasts] = React.useState<IChromecast[]>([]);
  const [logMessages, setLogMessages] = React.useState<string[]>([]);
  const [videoPath, rawSetVideoPath] = React.useState<string>();
  const [mediaServerPort, setMediaServerPort] = React.useState<number>();

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

    getPort().then(port => {
      addLogMessage(`Detected empty port ${port}, starting mediaserver`);
      mediaServerApp.listen(port);
      setMediaServerPort(port);
    });
  }, []);

  const setVideoPath = React.useCallback((path: string) => {
    addLogMessage(`Update videopath to ${path}`);
    setMediaServerVideoPath(path);
    rawSetVideoPath(path);
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        addLogMessage,
        chromecasts,
        logMessages,
        mediaServerPort,
        setChromecast,
        setVideoPath,
        videoPath
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export default PlayerProvider;
