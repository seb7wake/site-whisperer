import { OpenAI } from "openai";
import { supabase } from "./supabase";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const respondToMessage = async (
  message: string,
  chat: any,
  documents: any[]
) => {
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

export async function embedAndStoreChunk(
  title: string,
  url: string,
  content: string
) {
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
