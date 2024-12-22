import React from "react";
import ChatBody from "./ChatBody";
import ChatHeader from "./ChatHeader";

const Chat = ({
  currentChat,
  isCreatingChat,
}: {
  currentChat: any;
  isCreatingChat: boolean;
}) => {
  console.log("isCreatingChat", isCreatingChat);
  return (
    <div className="bg-gray-800 h-screen w-3/4">
      <ChatHeader currentChat={currentChat} />
      <ChatBody currentChat={currentChat} isCreatingChat={isCreatingChat} />
    </div>
  );
};

export default Chat;
