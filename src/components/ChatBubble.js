import React from "react";

class ChatBubble extends React.Component {
  render() {
    return (
      <div className="chat-bubble">
        <span className={`chat-name tag ${this.props.chat_data.color_code}`} >
          {this.props.chat_data.user_name}
        </span>
        {this.props.chat_data.message}
      </div>
    );
  }
}

export default ChatBubble;
