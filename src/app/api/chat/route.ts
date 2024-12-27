import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import { supabase } from "../../../lib/supabase";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { message, chatId } = await request.json();

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
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
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

    console.log(url);

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
  } catch (error) {
    console.error("Error in chat endpoint:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

const respondToMessage = async (
  message: string,
  chat: any,
  documents: any[]
) => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const systemMessage = `You are a helpful assistant answering questions about a webpage. 
      Use the following relevant excerpts from the page to inform your response:
      ${documents.map((doc) => doc.content).join("\n\n")}`;

  // Get previous messages from the chat
  const previousMessages = chat.messages.map((msg: any) => ({
    role: msg.role,
    content: msg.content,
  }));

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [
      { role: "system", content: systemMessage },
      ...previousMessages,
      { role: "user", content: message },
    ],
  });

  return response.choices[0].message.content;
};

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
