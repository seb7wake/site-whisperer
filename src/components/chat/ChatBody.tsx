import React, { useState } from "react";

const ChatBody = ({
  currentChat,
  isCreatingChat,
}: {
  currentChat: any;
  isCreatingChat: boolean;
}) => {
  const [url, setUrl] = useState("");

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
    <div className="flex flex-col h-full p-4">
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4 text-gray-300">
          {/* Messages will go here */}
          <p className="text-center text-gray-400">No messages yet</p>
        </div>
      </div>
    </div>
  );
};

export default ChatBody;
