import { update_data } from "./data_storage_utils";

export var global_this_obj = null;

export const createConnection = (is_host, host_id = null, previous_id = null) =>
  new Promise((resolve, reject) => {
    let peer_js_url = process.env.REACT_APP_PEERJS;
    let turn_url = process.env.REACT_APP_TURN;
    let turn_username = process.env.REACT_APP_TURN_USERNAME;
    let turn_credentials = process.env.REACT_APP_TURN_CREDENTIALS;
    const Peer = window.Peer;
    const settings = {
      debug: 2,
      // iceTransportPolicy: "relay",
      config: {
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      },
    };
    if (peer_js_url) {
      settings.host = peer_js_url;
      settings.port = "";
      settings.path = "/myapp";
    }
    if (turn_url) {
      settings.config.iceServers.push({
        urls: turn_url,
        username: turn_username,
        credential: turn_credentials,
      });
    }

    const peer = previous_id
      ? new Peer(previous_id, settings)
      : new Peer(settings);

    window.peer_obj = peer;
    window.is_host = is_host;
    if (!is_host) {
      var conn = peer.connect(host_id);
      handle_connection(conn);
    }

    peer.on("open", function (id) {
      console.log("connection open", id);
      window.peer_id = peer.id;
      resolve(peer.id, window.is_host);
    });

    //   Initializes connection
    peer.on("connection", function (conn) {
      console.log("connection called");
      handle_connection(conn);
    });

    peer.on("close", function () {
      console.log("peer closed");
      window.global_this_obj.notify(
        "Network disconnected please refresh",
        10000
      );
    });

    peer.on("disconnected", function () {
      console.log("peer disconnected");
      // peer.reconnect();
      window.global_this_obj.notify(
        "Network disconnected please refresh",
        10000
      );
    });
  });

function handle_connection(conn) {
  conn.on("data", function (data) {
    data_handler(data);
  });

  conn.on("close", function () {
    var connected_users = window.global_this_obj.state.connected_users;
    if (!connected_users || !connected_users[conn.peer]) {
      return;
    }
    const left_user_name = connected_users[conn.peer].user_name;
    delete connected_users[conn.peer];
    window.global_this_obj.setState({ connected_users: connected_users });
    window.global_this_obj.notify(`${left_user_name} has left the party`);
    if (window.is_host) {
      update_data(window.peer_obj.id, "connected_users", connected_users);
    }
  });

  window.connections.push(conn);

  if (window.is_host === true) {
    broadcast_new_connection(conn.peer);
  }
}

function data_handler(data) {
  if (typeof data === "object" && data !== null) {
    if (data.data_type === "chat") {
      chat_handler(data);
    } else if (data.data_type === "new_connection") {
      connect_to_peer(data.peer_id);
    } else if (data.data_type === "youtube") {
      handle_youtube(data);
    } else if (data.data_type === "intro") {
      handle_intro(data);
    } else if (data.data_type === "user_list") {
      handle_intro_init(data);
    } else if (data.data_type === "change_video") {
      change_video(data.video_id);
    }
  }
}

function broadcastData(data) {
  window.connections.forEach((conn) => {
    conn.send(data);
  });
}

function broadcast_new_connection(peer_id) {
  var msg = { data_type: "new_connection", peer_id: peer_id };
  for (var i = 0; i < window.connections.length; i++) {
    if (window.connections[i].peer === peer_id) {
      continue;
    }
    window.connections[i].send(msg);
  }
}

function connect_to_peer(peer_id) {
  const conn = window.peer_obj.connect(peer_id);
  handle_connection(conn);
}

export function bulk_connect(peer_ids, host_data) {
  for (let id in peer_ids) {
    setTimeout(function () {
      connect_to_peer(peer_ids[id]);
    }, 250);
  }
  const wait_time = 250 * peer_ids.length + 100;
  setTimeout(function () {
    console.log("intro called");
    introduce(host_data.user_name, host_data.color_code);
  }, wait_time);
}
// Chat utils
function chat_handler(chat_data) {
  var chat_log = window.global_this_obj.state.chat_log;
  chat_data.message = decodeURIComponent(
    escape(window.atob(chat_data.message))
  );

  chat_log.push(chat_data);
  window.global_this_obj.setState({
    chat_log: chat_log,
  });
}

export function send_chat(msg, user_name, is_host, color_code) {
  var msg_json = generate_chat_structure(msg, user_name, is_host, color_code);
  broadcastData(msg_json);
  chat_handler(msg_json);
}

function generate_chat_structure(msg, user_name, is_host, color_code) {
  var format = {
    data_type: "chat",
    user_name: user_name,
    user_type: is_host ? "Host" : "Client",
    message: btoa(unescape(encodeURIComponent(msg))),
    color_code: color_code,
    time_stamp: Date.now(),
  };
  return format;
}

//  Youtube utils

function handle_youtube(data) {
  var state = window.global_this_obj.state;
  if (state.youtube_video_id === "") {
    window.global_this_obj.setState({
      youtube_video_id: data.videoId,
      youtube_current_pos: Math.ceil(data.startSeconds),
      player_state: data.event,
    });
  } else {
    window.global_this_obj.setState({ isStateChangeFromBroadcastData: true });
    const player = window.yt_player;

    if (data.event === 2) {
      // isStateChangeFromBroadcastData = true;
      player.seekTo(data.startSeconds, true);
      player.pauseVideo();
      window.global_this_obj.notify(`${data.user_name} paused the video`);
    } else if (data.event === 1) {
      // isStateChangeFromBroadcastData = true;
      player.seekTo(Math.ceil(data.startSeconds), true);
      player.playVideo();
      window.global_this_obj.notify(`${data.user_name} started the video`);
    } else if (data.event === 3) {
      // isStateChangeFromBroadcastData = true;
      player.seekTo(data.startSeconds, true);
      player.pauseVideo();
      window.global_this_obj.notify(`${data.user_name} is buffering`);
    } else if (data.event === "playbackRateChange") {
      player.seekTo(data.startSeconds, true);
      player.setPlaybackRate(data.playbackRate);
      window.global_this_obj.notify(
        `${data.user_name} changed the playback rate to ${data.playbackRate}x`
      );
    }
    setTimeout(function () {
      window.global_this_obj.setState({
        isStateChangeFromBroadcastData: false,
      });
    }, 2500);
  }
}

export function sync_video(event = null) {
  if (
    window.global_this_obj.state.only_host_controls === true &&
    window.is_host !== true
  ) {
    return;
  }
  if (window.global_this_obj.state.isStateChangeFromBroadcastData) {
    return;
  }
  const payloadData = fetch_current_video_status(event);
  broadcastData(payloadData);
}

function fetch_current_video_status(event) {
  var yt_event;
  const player = window.yt_player;
  if (event !== null) {
    yt_event = event;
  } else {
    yt_event = player.getPlayerState();
  }

  var videoId = player.getVideoData()["video_id"];
  var startSeconds = player.getCurrentTime();
  var playbackRate = player.getPlaybackRate();

  var payload = {
    data_type: "youtube",
    user_name: window.global_this_obj.state.user_name,
    event: yt_event,
    videoId: videoId,
    startSeconds: startSeconds,
    playbackRate: playbackRate,
  };

  return payload;
}
// {
//   "data_type": "chat|youtube|webrtc",
//   "user_name": "Nishit",
//   "user_type": "Host|Client",
//   "message": "Test",
//   "time_stamp": "ISO timestamp"
// }

// misc

function handle_intro(data) {
  var connected_users = window.global_this_obj.state.connected_users;
  connected_users[data.peer_id] = {
    user_name: data.user_name,
    color_code: data.color_code,
  };
  window.global_this_obj.setState({ connected_users: connected_users });
  window.global_this_obj.notify(`${data.user_name} has joined the party`);
  if (window.is_host) {
    update_data(window.peer_obj.id, "connected_users", connected_users);
    setTimeout(function () {
      sync_video();
      var msg_user_list = {
        data_type: "user_list",
        user_list: window.global_this_obj.state.connected_users,
        only_host_controls: window.global_this_obj.state.only_host_controls,
      };
      broadcastData(msg_user_list);
    }, 250);
  }
}

function handle_intro_init(data) {
  window.global_this_obj.setState({
    connected_users: data.user_list,
    only_host_controls: data.only_host_controls,
  });
}

export function introduce(user_name, color_code) {
  var format = {
    data_type: "intro",
    user_name: user_name,
    peer_id: window.peer_obj.id,
    color_code: color_code,
    time_stamp: Date.now(),
  };
  broadcastData(format);
}

export function change_video(video_id, broadcast = false) {
  var player = window.yt_player;
  player.loadVideoById(video_id);
  if (broadcast) {
    var format = {
      data_type: "change_video",
      video_id: video_id,
    };
    broadcastData(format);
    // broadcast it to everyone
  }
}

export function parseIdFromURL(url) {
  const regExp =
    /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return match[2];
  } else {
    return false;
  }
}
