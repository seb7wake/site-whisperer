"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import ChatBody from "@/components/chat/ChatBody";
import ChatHeader from "@/components/chat/ChatHeader";

export default function Home() {
  const [chats, setChats] = useState<any[]>([]);
  const [currentChat, setCurrentChat] = useState<any>(null);
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  useEffect(() => {
    getChats();
  }, []);

  const getChats = async () => {
    const response = await fetch("/api/chats");
    const data = await response.json();
    setChats(data);
  };

  const refetchChats = async () => {
    const response = await fetch("/api/chats");
    const data = await response.json();
    setChats(data);
    setCurrentChat(data[0]); // Get the most recently added chat
    setIsCreatingChat(false);
  };

  const handleChatSelection = async (chatId: string) => {
    const response = await fetch(`/api/chat?chatId=${chatId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    console.log("current chat", data);
    setCurrentChat(data.chat);
  };

  return (
    <div className="flex w-full">
      <Sidebar
        chats={chats}
        setCurrentChat={setCurrentChat}
        handleChatSelection={handleChatSelection}
        currentChat={currentChat}
        setIsCreatingChat={setIsCreatingChat}
      />
      <div className="flex flex-col bg-gray-800 h-screen w-3/4">
        <ChatHeader currentChat={currentChat} />
        <ChatBody
          currentChat={currentChat}
          setCurrentChat={setCurrentChat}
          isCreatingChat={isCreatingChat}
          refetchChats={refetchChats}
        />
      </div>
    </div>
  );
}
