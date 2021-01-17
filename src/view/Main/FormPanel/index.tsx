import * as React from "react";
import { PlayerContext } from "../../../provider/PlayerProvider";

const FormPanel = (): React.ReactElement => {
  const { chromecasts } = React.useContext(PlayerContext);

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
      <form>
        <ul>
          <li>
            <label htmlFor="video">Video</label>
            <input type="file" name="video" id="video" />
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
