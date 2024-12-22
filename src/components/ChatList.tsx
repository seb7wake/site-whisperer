import React from "react";

const ChatList = ({
  chats,
  currentChat,
  handleChatSelection,
}: {
  chats: any[];
  currentChat: any;
  handleChatSelection: (chatId: string) => void;
}) => {
  return (
    <div className="flex flex-col">
      {chats.length === 0 ? (
        <div className="p-4 text-gray-400 text-center">No chats yet</div>
      ) : (
        chats.map((chat) => (
          <div
            key={chat.id}
            className={`p-4 text-white hover:bg-gray-700 cursor-pointer transition-colors ${
              currentChat?.id === chat.id ? "bg-gray-700" : ""
            }`}
            onClick={() => handleChatSelection(chat.id)}
          >
            {chat.title}
          </div>
        ))
      )}
    </div>
  );
};

export default ChatList;
