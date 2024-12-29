import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { scrape } from "../../../lib/scraper";
import { embedAndStoreChunk } from "@/lib/openai";

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

    const pages = await scrape(url);
    const shortUrl = new URL(url).origin + new URL(url).pathname;

    // Process sections in parallel for better performance
    await Promise.all(
      pages.map((page) =>
        embedAndStoreChunk(page.title, page.url, page.sections.join("\n"))
      )
    );

    console.log("pages:", pages);

    const newChat = await prisma.chat.create({
      data: {
        title: pages[0].title === "" ? "Untitled Chat" : pages[0].title,
        url,
        shortUrl,
        messages:
          pages[0].title === ""
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
