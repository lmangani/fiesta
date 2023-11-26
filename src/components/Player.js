import React from "react";
import ReactPlayer from 'react-player'
import { sync_video } from "../utils/webRTC_utils";

const USE_OLD_PLAYER = true;

class Player extends React.Component {
  constructor(props) {
    super(props);
    console.log(props);
    this.state = {
      player: ""
    };
  }
  componentDidUpdate() {
    if (this.state.player === "" && this.props.youtube_video_id !== "") {
      this.loadScript();
    }
  }
  loadScript = () => {
    if (!window.YT) {
      // If not, load the script asynchronously
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";

      // onYouTubeIframeAPIReady will load the video after the script is loaded
      window.onYouTubeIframeAPIReady = this.loadVideo;

      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    } else {
      // If script is already there, load the video directly
      if (window.YT.Player) {
        this.loadVideo();
      }
    }
  };
  loadVideo = () => {
    const maxPlayerWidth = Math.round(window.innerWidth * (window.innerWidth > 768 ? 0.7 : 1));
    const maxPlayerHeight = Math.round(window.innerHeight * 0.6);

    const playerWidth = Math.min(Math.round(maxPlayerHeight * 16/9), maxPlayerWidth);
    const playerHeight = Math.min(Math.round(maxPlayerWidth * 9/16), maxPlayerHeight);

    this.state.player = new window.YT.Player('youtube-player-iframe', {
      videoId: this.props.youtube_video_id,
      width: playerWidth,
      height: playerHeight,
      playerVars: {
        start: Math.ceil(this.props.youtube_current_pos)
      },
      events: {
        onReady: this.onPlayerReady,
        onStateChange: this.onPlayerStateChange,
        onPlaybackRateChange: this.onPlayerPlaybackRateChange
      }
    });
    window.yt_player = this.state.player;
  };

  onPlayerReady = event => {
    if (this.props.player_state === 1) {
      event.target.playVideo();
    }
  };
  onPlayerStateChange = event => {
    if (!this.props.isStateChangeFromBroadcastData) {
      if (
        event.data === window.YT.PlayerState.PLAYING ||
        event.data === window.YT.PlayerState.PAUSED
      ) {
        sync_video();
      }
    }
  };
  onPlayerPlaybackRateChange = event => {
    console.log(event);
    if (this.props.is_host) {
      sync_video("playbackRateChange");
    }
  };
  render() {
    // if (!this.props.youtube_video_id) {
    //   return <div>Video not loaded</div>;
    // }
    return USE_OLD_PLAYER ? (
      <div className="player_container">
        <div id={`youtube-player-iframe`} />
      </div>
    ) : (
      <div class="video-player-wrapper">
        <ReactPlayer
          className="video-player"
          url={this.props.videoUrl}
          width='100%'
          height='100%'
          controls
        />
      </div>
    );
  }
}

export default Player;
