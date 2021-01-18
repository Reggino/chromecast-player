import * as React from "react";
import { PlayerContext } from "../../../provider/PlayerProvider";
import { remote } from "electron";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Client, DefaultMediaReceiver } from "castv2-client";

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
            extensions: ["mp4", "webm", "mp3", "jpg"],
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
      setChromecast(chromecasts[e.target.value]);
    },
    [chromecasts, setChromecast]
  );

  const onSubmit = React.useCallback(
    (e) => {
      console.log(videoPath, chromecast);
      if (!chromecast) {
        throw new Error("No Chromecast");
      }
      e.preventDefault();
      const client = new Client();
      client.connect(chromecast.ip, () => {
        client.launch(DefaultMediaReceiver, (err: Error, player: any) => {
          if (err) {
            throw err;
          }
          player.load(
            {
              // Here you can plug an URL to any mp4, webm, mp3 or jpg file with the proper contentType.
              contentId: `http://${localIpAddress}:${mediaServerPort}/video`,
              // contentType: "video/mp4",
              // streamType: "BUFFERED", // or LIVE
              //
              // // Title and cover displayed while buffering
              // metadata: {
              //   type: 0,
              //   metadataType: 0,
              //   title: "Big Buck Bunny",
              //   images: [
              //     {
              //       url:
              //         "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg",
              //     },
              //   ],
              // },
            },
            { autoplay: true },
            (err: Error, status: any) => {
              if (err) {
                throw err;
              }
              addLogMessage(JSON.stringify(status));
            }
          );
        });
      });
    },
    [addLogMessage, chromecast, videoPath]
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
                    key={index}
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
