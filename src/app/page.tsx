"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Chat from "../components/chat/Chat";

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

  const handleChatSelection = async (chatId: string) => {
    const response = await fetch(`/api/chat?chatId=${chatId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    console.log("current chat", data);
    setCurrentChat(data);
  };

  return (
    <div className="flex h-screen w-full">
      <Sidebar
        chats={chats}
        setCurrentChat={setCurrentChat}
        handleChatSelection={handleChatSelection}
        currentChat={currentChat}
        setIsCreatingChat={setIsCreatingChat}
      />
      <Chat currentChat={currentChat} isCreatingChat={isCreatingChat} />
    </div>
  );
}
