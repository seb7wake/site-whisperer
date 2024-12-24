import React, { useState } from "react";

const ChatBody = ({
  currentChat,
  isCreatingChat,
}: {
  currentChat: any;
  isCreatingChat: boolean;
}) => {
  const [url, setUrl] = useState("");
  const [message, setMessage] = useState("");
  const handleCreateChat = async () => {
    const response = await fetch("/api/new_chat", {
      method: "POST",
      body: JSON.stringify({ url }),
    });

    const data = await response.json();
    console.log(data);
  };

  if (!currentChat && !isCreatingChat) {
    return null;
  }

  const handleSendMessage = async () => {
    const response = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message, chatId: currentChat.id }),
    });
    const data = await response.json();
    console.log(data);
  };

  if (!currentChat && isCreatingChat) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-gray-300">
        <h2 className="text-2xl font-semibold mb-4">Enter a website URL</h2>
        <div className="w-full max-w-md">
          <input
            type="url"
            placeholder="Enter website URL"
            className="w-full px-4 py-2 mb-4 text-gray-800 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button
            className="w-full px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            onClick={handleCreateChat}
          >
            Talk to this website
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col  flex-1 overflow-y-auto h-full p-4">
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4 text-gray-300">
          {currentChat?.messages?.length === 0 ? (
            <p className="text-center text-gray-400">No messages yet</p>
          ) : (
            currentChat?.messages?.map((message: any, index: number) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-200"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          placeholder="Type your message..."
          className="flex-1 px-4 py-2 bg-gray-700 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          onClick={handleSendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBody;
