import React from "react";
import { send_chat } from "../utils/webRTC_utils";
import ChatBubble from "./ChatBubble";
import UserList from "./UserList";

class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.chatBottom = React.createRef();
    this.state = {
      message: '',
    };
  }

  componentDidUpdate() {
    this.chatBottom.current.scrollIntoView({ behavior: "smooth" });
  }

  add_text = e => {
    this.setState({ message: e.target.value });
  };

  send_message = e => {
    e.preventDefault();
    if (this.state.message === "") {
      return;
    }
    send_chat(
      this.state.message,
      this.props.user_name,
      this.props.is_host,
      this.props.color_code
    );
    this.setState({ message: "" });
  };

  render() {
    return (
      <div className="chat-panel box">
        <UserList
          connectedUsers={this.props.connected_users}
          only_host_controls={this.props.only_host_controls}
          is_host={this.props.is_host}
        />
        <div className="chat-message-panel">
          {this.props.chat_log.map((chat_data, index) => {
            return <ChatBubble key={index} chat_data={chat_data}/>;
          })}
          <span ref={this.chatBottom} id="chat-bottom" />
        </div>
        <form onSubmit={this.send_message}>
          <div className="field is-grouped">
            <p className="control is-expanded">
              <input
                className="input"
                value={this.state.message}
                type="text"
                placeholder="Chat..."
                onChange={this.add_text}
              />
            </p>
            <p className="control">
              <button className="button is-primary">
                <ion-icon name="paper-plane"></ion-icon>
              </button>
            </p>
          </div>
        </form>
      </div>
    );
  }
}

export default Chat;
