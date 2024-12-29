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
            className={`p-4 text-white hover:bg-gray-700 cursor-pointer transition-colors flex items-center gap-3 border-b border-gray-700 ${
              currentChat?.id === chat.id ? "bg-gray-700" : ""
            }`}
            onClick={() => handleChatSelection(chat.id)}
          >
            <div className="flex-grow min-w-0">
              <div className="flex justify-between items-start">
                <h3 className="font-bold truncate">
                  {chat.title || "Untitled Chat"}
                </h3>
                <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                  {new Date(
                    chat.lastMessageAt || chat.createdAt
                  ).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-gray-400 truncate mt-1">
                {chat.lastMessageContent || "No messages yet"}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ChatList;
