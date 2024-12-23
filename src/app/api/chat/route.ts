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
      match_threshold: 0.5,
      match_count: 5,
      // fix this - only works with null
      input_url: null,
    });

    if (error) {
      throw new Error(`Error matching documents: ${error.message}`);
    }

    return NextResponse.json({ matches: data });
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
