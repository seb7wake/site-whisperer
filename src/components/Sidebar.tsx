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
    <div className="bg-gray-800 h-screen w-1/4 border-r border-gray-700">
      <button
        onClick={() => {
          setCurrentChat(null);
          setIsCreatingChat(true);
        }}
        className="w-full p-4 text-white hover:bg-gray-700 transition-colors"
      >
        + New Chat
      </button>
      <ChatList
        chats={chats}
        currentChat={currentChat}
        handleChatSelection={handleChatSelection}
      />
    </div>
  );
};

export default Sidebar;
