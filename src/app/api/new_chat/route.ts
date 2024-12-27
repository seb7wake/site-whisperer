import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { scrape } from "../../../lib/scraper";
import { supabase } from "../../../lib/supabase";
import OpenAI from "openai";

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    const { title, sections } = await scrape(url);
    const shortUrl = new URL(url).origin + new URL(url).pathname;

    // Process sections in parallel for better performance
    await Promise.all(
      sections.map((section) => embedAndStoreChunk(title, url, section))
    );

    const newChat = await prisma.chat.create({
      data: {
        title,
        url,
        shortUrl,
        messages:
          title === ""
            ? {
                create: [
                  { content: "Sorry, I wasn't able to read the URL provided." },
                ],
              }
            : undefined,
      },
    });

    return NextResponse.json(newChat);
  } catch (error) {
    console.error("Error creating chat:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create chat",
      },
      { status: 500 }
    );
  }
}

async function embedAndStoreChunk(title: string, url: string, content: string) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: content,
    });

    const [{ embedding }] = embeddingResponse.data;

    const { error } = await supabase.from("documents").insert({
      title,
      url,
      content,
      embedding,
    });

    if (error) {
      throw new Error(`Failed to store embedding: ${error.message}`);
    }
  } catch (error) {
    console.error("Error in embedAndStoreChunk:", error);
    throw error; // Re-throw to be handled by the caller
  }
}
