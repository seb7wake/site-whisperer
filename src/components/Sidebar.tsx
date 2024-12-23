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
      <button
        onClick={() => {
          setCurrentChat(null);
          setIsCreatingChat(true);
        }}
        className="w-full p-4 text-white hover:bg-gray-700 transition-colors"
      >
        + New Chat
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
