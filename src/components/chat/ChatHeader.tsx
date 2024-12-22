import React from "react";

const ChatHeader = ({ currentChat }: { currentChat: any }) => {
  return (
    <div className="bg-gray-800 p-4 border-b border-gray-700">
      <h1 className="text-white text-xl font-semibold">
        {currentChat ? currentChat.title : "New Chat"}
      </h1>
    </div>
  );
};

export default ChatHeader;
