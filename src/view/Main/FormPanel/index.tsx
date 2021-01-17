import * as React from "react";
import { PlayerContext } from "../../../provider/PlayerProvider";
import { remote } from "electron";

const FormPanel = (): React.ReactElement => {
  const {
    addLogMessage,
    chromecasts,
    setVideoPath,
    mediaServerPort,
    videoPath
  } = React.useContext(PlayerContext);

  const onVideoButtonClick = React.useCallback(() => {
    remote.dialog
      .showOpenDialog({
        title: "Chromecast supported video files (MP4 / WebM)",
        filters: [
          // @todo maybe enable?
          // {
          //   name: "Chromecast supported video files (MP4 / WebM)"
          //   extensions: ["mp4", "webm"]
          // }
        ],
        properties: ["openFile"]
      })
      .then(result => {
        if (!result.canceled && result.filePaths.length) {
          setVideoPath(result.filePaths[0]);
        }
      })
      .catch(err => {
        addLogMessage(err.message);
      });
  }, []);

  const onSubmit = React.useCallback(e => {
    console.log(e);
  }, []);

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
      <form onSubmit={onSubmit}>
        <ul>
          <li>
            <label htmlFor="video">Video</label>
            <input
              type="button"
              value="Choose File"
              onClick={onVideoButtonClick}
            />
            {videoPath ? <video src={`http://localhost:${mediaServerPort}/video`} controls /> : null}
          </li>
          <li>
            <label htmlFor="subtitles">Subtitles</label>
            <input type="file" name="subtitles" id="subtitles" />
          </li>
          <li>
            <label htmlFor="chromecast">Chromecast</label>
            <select name="chromecast" id="chromecast">
              {chromecasts.length ? (
                chromecasts.map(chromecast => (
                  <option
                    key={chromecast.ip}
                    value={chromecast.ip}
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
          disabled={true}
          style={{ fontSize: 24, marginLeft: 100, marginTop: 10 }}
        />
      </form>
    </div>
  );
};

export default FormPanel;
