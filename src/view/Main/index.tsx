import * as React from "react";

export default (): React.ReactElement => {
  return (
    <div style={{ display: "flex" }}>
      <div style={{ border: "1px solid black", margin: 10, padding: 10 }}>
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
                <option>Huiskamer</option>
              </select>
            </li>
          </ul>
          <input type="submit" value="PLAY" disabled={true} style={{ fontSize: 24, marginLeft: 100, marginTop: 10 }} />
        </form>
      </div>
      <div style={{ border: "1px solid black", margin: 10, padding: 10 }}>
        <h2>Log</h2>
        <pre>Interface initialzed</pre>
      </div>
    </div>
  );
};
