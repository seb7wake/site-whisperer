import React from "react";

const ChatHeader = ({ currentChat }: { currentChat: any }) => {
  return (
    <div className="bg-gray-800 p-4 border-b border-gray-700">
      <h1 className="text-white text-xl font-semibold">
        {currentChat ? (
          <a
            href={currentChat.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-blue-500"
          >
            {currentChat.title || "Untitled Chat"}
          </a>
        ) : (
          "New Chat"
        )}
      </h1>
    </div>
  );
};

export default ChatHeader;
