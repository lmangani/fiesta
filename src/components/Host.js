import React, { useState, useEffect } from "react";
import { Redirect } from "react-router-dom";
import { createConnection, parseIdFromURL } from "../utils/webRTC_utils";
import { storeData } from "../utils/data_storage_utils";

const Host = () => {
  const [userName, setUserName] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [clipboardHasVideo, setClipboardHasVideo] = useState(false);
  const [hostPeerId, setHostPeerId] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (navigator.clipboard) {
      navigator.clipboard.readText()
        .then(text => {
          setClipboardHasVideo(parseIdFromURL(text));
        });
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    createConnection(true).then((peerId) => {
      setHostPeerId(peerId);
    });
  };

  if (hostPeerId) {
    const videoId = clipboardHasVideo ? clipboardHasVideo : parseIdFromURL(videoUrl);
    storeData(hostPeerId, {
      userName,
      videoUrl,
      videoId,
      isHost: true,
      onlyHostControls: false,
    });
    return (
      <Redirect push to={{ pathname: hostPeerId }}/>
    );
  }
  return (
    <section className="section">
      <div className="container">
        <div className="columns is-centered">
          <div className="column is-half">
            <div className="card box">
              <div className="card-content">
                <form onSubmit={handleSubmit}>
                  <div className="field">
                    <label className="label">Username</label>
                    <div className="control">
                      <input
                        className="input"
                        placeholder="Please enter your username"
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label className="label">Youtube Link</label>
                    <div className="field has-addons">
                      <div className="control" style={{flex: '1'}}>
                        <input
                          className="input"
                          type="text"
                          placeholder={clipboardHasVideo ? 'Video found in clipboard!' : 'Youtube link'}
                          onChange={(e) => {setVideoUrl(e.target.value)}}
                          value={videoUrl}
                        />
                      </div>
                      {clipboardHasVideo && (
                        <p className="control">
                          <span className={`button ${videoUrl === '' ? 'is-primary' : 'is-static'}`}>
                            <ion-icon name="clipboard-outline" style={{marginRight: '0.5rem'}}></ion-icon>
                            {clipboardHasVideo}
                          </span>
                        </p>
                      )}
                    </div>

                  </div>

                  <div className="field">
                    <label className="checkbox">
                      <input type="checkbox" name="onlyHost"/>
                      &nbsp;Only allow host to control video
                    </label>
                  </div>
                  <div className="buttons is-right">
                    <button
                      className={
                        "button is-primary" +
                          (submitted ? " is-loading" : "")
                      }
                    >
                      Party
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

  );
};

export default Host;
