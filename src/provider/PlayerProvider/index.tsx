import React from "react";
import bonjour from "bonjour";
import getPort from "get-port";
import { mediaServerApp, setMediaServerVideoPath } from "./mediaServer";
import { networkInterfaces } from "os";

interface IChromecast {
  ip: string;
  name: string;
  type: string;
}

interface IPlayerContext {
  addLogMessage: (message: string) => void;
  chromecast?: IChromecast;
  chromecasts: IChromecast[];
  localIpAddress?: string;
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
  setVideoPath: emptyFn,
});

const PlayerProvider = ({ children }: any) => {
  const [chromecast, setChromecast] = React.useState<IChromecast>();
  const [chromecasts, setChromecasts] = React.useState<IChromecast[]>([]);
  const [logMessages, setLogMessages] = React.useState<string[]>([]);
  const [videoPath, rawSetVideoPath] = React.useState<string>();
  const [localIpAddresses, setLocalIpAddresses] = React.useState<string[]>([]);
  const [mediaServerPort, setMediaServerPort] = React.useState<number>();

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

    getPort().then((port) => {
      addLogMessage(`Detected empty port ${port}, starting mediaserver`);
      mediaServerApp.listen(port);
      setMediaServerPort(port);
    });

    const nets = networkInterfaces();
    const localIpAddresses = Object.values(nets).reduce<string[]>(
      (prev, ips = []) => {
        ips.forEach((ip) => {
          if (
            ip.family === "IPv4" &&
            ip.internal === false &&
            !ip.address.startsWith("172.17.0")
          ) {
            prev.push(ip.address);
          }
        });
        return prev;
      },
      []
    );
    addLogMessage(`Found local IP address: ${localIpAddresses.join(", ")}`);
    setLocalIpAddresses(localIpAddresses);
  }, [addLogMessage]);

  const setVideoPath = React.useCallback(
    (path: string) => {
      addLogMessage(`Update videopath to ${path}`);
      setMediaServerVideoPath(path);
      rawSetVideoPath(path);
    },
    [addLogMessage]
  );

  const localIpAddress = React.useMemo(() => {
    const chromecastIpNibbles = chromecast?.ip.split(".") || [];
    const matchLength = localIpAddresses.map((ip) => {
      let nibblePointer = 0;
      const nibbles = ip.split(".");
      while (nibbles[nibblePointer] === chromecastIpNibbles[nibblePointer]) {
        nibblePointer++;
      }
      return nibblePointer;
    });
    const bestMatchIndex = matchLength.indexOf(Math.max(...matchLength));
    return localIpAddresses[bestMatchIndex];
  }, [chromecast, localIpAddresses]);

  return (
    <PlayerContext.Provider
      value={{
        addLogMessage,
        chromecast,
        chromecasts,
        localIpAddress,
        logMessages,
        mediaServerPort,
        setChromecast,
        setVideoPath,
        videoPath,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export default PlayerProvider;
