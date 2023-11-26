import React from "react";

const UserList = ({connectedUsers}) => {
  return (
    <div className="username-container">
      {Object.entries(connectedUsers).map(([_, userInfo]) =>
        <span className={`tag ${userInfo.color_code}`}>{userInfo.user_name}</span>
      )}
      <span class="tag is-link is-light">Queue (1/1)</span>
    </div>
  );
};

export default UserList;
