import * as React from "react";
import { PlayerContext } from "../../../provider/PlayerProvider";
import { remote, ipcRenderer } from "electron";

const FormPanel = (): React.ReactElement => {
  const {
    addLogMessage,
    chromecast,
    chromecasts,
    localIpAddress,
    mediaServerPort,
    setChromecast,
    setVideoPath,
    videoPath,
  } = React.useContext(PlayerContext);

  const onVideoButtonClick = React.useCallback(() => {
    remote.dialog
      .showOpenDialog({
        title: "Chromecast supported video files",
        filters: [
          {
            name: "Chromecast supported media files",
            extensions: ["mp4", "webm"],
          },
        ],
        properties: ["openFile"],
      })
      .then((result) => {
        if (!result.canceled && result.filePaths.length) {
          setVideoPath(result.filePaths[0]);
        }
      })
      .catch((err) => {
        addLogMessage(err.message);
      });
  }, [addLogMessage, setVideoPath]);

  const onChromecastChange = React.useCallback(
    (e) => {
      setChromecast(
        chromecasts.find((chromecast) => chromecast.ip === e.target.value)
      );
    },
    [chromecasts, setChromecast]
  );

  const onSubmit = React.useCallback(
    (e) => {
      if (!chromecast) {
        throw new Error("No Chromecast");
      }
      if (!videoPath) {
        throw new Error("No Videopath");
      }
      e.preventDefault();
      ipcRenderer
        .invoke("start", chromecast, {
          // Here you can plug an URL to any mp4, webm, mp3 or jpg file with the proper contentType.
          contentId: `http://${localIpAddress}:${mediaServerPort}/video`,
          contentType: videoPath.match(/\.mp4$/i) ? "video/mp4" : "video/webm",
          streamType: "BUFFERED", // or LIVE
          // // Title and cover displayed while buffering
          metadata: {
            type: 0,
            metadataType: 0,
            title: videoPath.split(/[/\\]/).pop(),
            //   images: [
            //     {
            //       url:
            //         "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg",
            //     },
            //   ],
          },
        })
        .then((status) => addLogMessage(JSON.stringify(status, null, "\t")));
    },
    [addLogMessage, chromecast, localIpAddress, mediaServerPort, videoPath]
  );

  return (
    <div
      style={{
        flex: 1,
        border: "1px solid black",
        margin: 10,
        padding: 10,
        overflow: "auto",
      }}
    >
      <form onSubmit={onSubmit}>
        <ul>
          <li>
            <label htmlFor="video">Video</label>
            <input
              type="button"
              value="Choose File"
              onClick={onVideoButtonClick}
            />
            {videoPath ? (
              <video
                src={`http://localhost:${mediaServerPort}/video`}
                controls
              />
            ) : null}
          </li>
          <li>
            <label htmlFor="subtitles">Subtitles</label>
            <input type="file" name="subtitles" id="subtitles" />
          </li>
          <li>
            <label htmlFor="chromecast">Chromecast</label>
            <select
              name="chromecast"
              id="chromecast"
              onChange={onChromecastChange}
              value={chromecast?.ip}
            >
              {chromecasts.length ? (
                chromecasts.map((chromecast, index) => (
                  <option
                    key={chromecast.ip}
                    value={index}
                  >{`${chromecast.name} (${chromecast.type})`}</option>
                ))
              ) : (
                <option value="">No Chromecast detected!</option>
              )}
            </select>
          </li>
        </ul>
        <input
          type="submit"
          value="PLAY"
          disabled={!videoPath || !chromecast}
          style={{ fontSize: 24, marginLeft: 100, marginTop: 10 }}
        />
      </form>
    </div>
  );
};

export default FormPanel;
