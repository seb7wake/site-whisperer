import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import { supabase } from "../../../lib/supabase";

export async function POST(request: Request) {
  try {
    const { message, chatId } = await request.json();

    const chat = await supabase
      .from("chats")
      .select("*")
      .eq("id", chatId)
      .single();

    const url = chat.data?.url;

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

    // Search for similar documents
    const { data, error } = await supabase.rpc("match_documents", {
      query_embedding: embedding,
      match_threshold: 0.8,
      match_count: 5,
      url: url,
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
  console.log("chatId", chatId);
  const chat = await supabase
    .from("chats")
    .select("*, messages(*)")
    .eq("id", chatId)
    .single();
  return NextResponse.json({ chat });
}
