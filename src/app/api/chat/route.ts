import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import { supabase } from "../../../lib/supabase";
import prisma from "@/lib/prisma";
import { respondToMessage } from "@/lib/openai";

export async function POST(request: Request) {
  if (!request.body) {
    return NextResponse.json(
      { error: "Request body is required" },
      { status: 400 }
    );
  }

  const { message, chatId } = await request.json();

  if (!message || !chatId) {
    return NextResponse.json(
      { error: "Message and chatId are required" },
      { status: 400 }
    );
  }

  const chat = await prisma.chat.findUnique({
    where: {
      id: chatId,
    },
    include: {
      messages: true,
    },
  });

  if (!chat) {
    return NextResponse.json({ error: "Chat not found" }, { status: 404 });
  }

  // Update chat with new message
  await prisma.chat.update({
    where: {
      id: chatId,
    },
    data: {
      lastMessageAt: new Date(),
      lastMessageContent: message,
      messages: {
        create: {
          role: "user",
          content: message,
        },
      },
    },
  });

  const url = chat.url;

  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // Get embedding for the message
  const embeddingResponse = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: message,
  });

  const [{ embedding }] = embeddingResponse.data;

  // Search for similar documents
  const { data, error } = await supabase.rpc("match_documents", {
    query_embedding: embedding,
    match_threshold: 0.6,
    match_count: 5,
    input_url: url,
  });

  if (error) {
    throw new Error(`Error matching documents: ${error.message}`);
  }

  const response = await respondToMessage(message, chat, data);

  const updatedChat = await prisma.chat.update({
    where: {
      id: chatId,
    },
    data: {
      lastMessageAt: new Date(),
      lastMessageContent: response || "",
      messages: {
        create: {
          role: "assistant",
          content: response || "",
        },
      },
    },
    include: {
      messages: true,
    },
  });

  const lastMessage = updatedChat.messages[updatedChat.messages.length - 1];

  return NextResponse.json({ matches: data, response: lastMessage });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get("chatId");
  if (!chatId) {
    return NextResponse.json({ error: "Chat ID is required" }, { status: 400 });
  }
  const chat = await prisma.chat.findUnique({
    where: {
      id: chatId,
    },
    include: {
      messages: true,
    },
  });
  return NextResponse.json({ chat });
}
