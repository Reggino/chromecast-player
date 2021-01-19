import * as React from "react";
import { PlayerContext } from "../../../provider/PlayerProvider";
import { remote, ipcRenderer } from "electron";

// chrome.cast.media.Media
// https://developers.google.com/cast/docs/reference/chrome/chrome.cast.media#.PlayerState

interface IMedia {
  playerState: "IDLE" | "PLAYING" | "PAUSED" | "BUFFERING";
}

const FormPanel = (): React.ReactElement => {
  const {
    addLogMessage,
    chromecast,
    chromecasts,
    setChromecast,
    setVideoPath,
    setSubtitlesPath,
    subtitlesPath,
    videoPath,
  } = React.useContext(PlayerContext);

  const [media, setMedia] = React.useState<IMedia>({
    playerState: "IDLE",
  });

  const onVideoButtonClick = React.useCallback(() => {
    remote.dialog
      .showOpenDialog({
        title: "Chromecast supported video files (.mp4 / .webm)",
        filters: [
          {
            name: "Chromecast supported video files (.mp4 / .webm)",
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

  const onSubtitlesButtonClick = React.useCallback(() => {
    remote.dialog
      .showOpenDialog({
        title: "Chromecast supported subtitle files  (.srt / .vtt)",
        filters: [
          {
            name: "Chromecast supported subtitle files  (.srt / .vtt)",
            extensions: ["srt", "vtt"],
          },
        ],
        properties: ["openFile"],
      })
      .then((result) => {
        if (!result.canceled && result.filePaths.length) {
          setSubtitlesPath(result.filePaths[0]);
        }
      })
      .catch((err) => {
        addLogMessage(err.message);
      });
  }, [addLogMessage, setSubtitlesPath]);

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

      setMedia({ playerState: "BUFFERING" });
      e.preventDefault();
      ipcRenderer
        .invoke("startVideo", chromecast, videoPath, subtitlesPath)
        .then((media) => {
          setMedia(media);
          addLogMessage(JSON.stringify(media, null, "\t"));
        });
    },
    [addLogMessage, chromecast, subtitlesPath, videoPath]
  );
  const isIdle = media.playerState === "IDLE";

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
              disabled={!isIdle}
            />
            <div>
              <small>Supports: .mp4 / .webm</small>
            </div>
            {/*{videoPath && isIdle ? (*/}
            {/*  <fieldset>*/}
            {/*    <legend>Preview</legend>*/}
            {/*    <video*/}
            {/*      src={`http://localhost:${mediaServerPort}/video?${videoPath}`}*/}
            {/*      controls*/}
            {/*    />*/}
            {/*  </fieldset>*/}
            {/*) : null}*/}
          </li>
          <li>
            <label htmlFor="subtitles">Subtitles</label>
            <input
              type="button"
              value="Choose File"
              onClick={onSubtitlesButtonClick}
              disabled={!isIdle}
            />
            <div>
              <small>Supports: .srt / .vtt</small>
            </div>
          </li>
          <li>
            <label htmlFor="chromecast">Chromecast</label>
            <select
              name="chromecast"
              id="chromecast"
              onChange={onChromecastChange}
              value={chromecast?.ip}
              disabled={!isIdle}
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
          value={isIdle ? "PLAY" : "STOP"}
          disabled={!videoPath || !chromecast}
          style={{ fontSize: 24, marginLeft: 100, marginTop: 10 }}
        />
      </form>
    </div>
  );
};

export default FormPanel;
