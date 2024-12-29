import React from "react";
import ChatList from "./ChatList";

const Sidebar = ({
  chats,
  setCurrentChat,
  currentChat,
  setIsCreatingChat,
  handleChatSelection,
}: {
  chats: any[];
  setCurrentChat: (chat: any) => void;
  currentChat: any;
  setIsCreatingChat: (isCreatingChat: boolean) => void;
  handleChatSelection: (chatId: string) => void;
}) => {
  return (
    <div className="flex flex-col bg-gray-800 w-1/4 h-screen border-r border-gray-700 overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        <h1 className="text-white text-xl font-semibold">Chats</h1>
      </div>
      <button
        onClick={() => {
          setCurrentChat(null);
          setIsCreatingChat(true);
        }}
        className="w-full p-4 text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium shadow-sm"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
            clipRule="evenodd"
          />
        </svg>
        New Chat
      </button>
      <div className="flex-1 overflow-y-auto">
        <ChatList
          chats={chats}
          currentChat={currentChat}
          handleChatSelection={handleChatSelection}
        />
      </div>
    </div>
  );
};

export default Sidebar;
