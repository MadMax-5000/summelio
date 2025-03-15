import { db } from "@/db";
import { sendMessageValidator } from "@/lib/validators/SendMessageValidator";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { openai } from "@/lib/openai";
import { OpenAIStream, StreamingTextResponse } from "ai";
// Importing the type if needed. Adjust the path based on your package structure.
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions/completions";

interface Message {
  isUserMessage: boolean;
  text: string;
}

export const POST = async (req: NextRequest) => {
  // Parse the request body and validate the input
  const body = await req.json();
  const user = await currentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  const userId = user.id;
  const { fileId, message } = sendMessageValidator.parse(body);

  // Fetch the file and ensure it's a YouTube file
  const file = await db.file.findFirst({
    where: {
      id: fileId,
      userId,
    },
  });
  if (!file) return new Response("File not found", { status: 404 });
  if (file.type !== "youtube")
    return new Response("Invalid file type for this endpoint", { status: 400 });

  // Save the user's message to the database
  await db.message.create({
    data: {
      text: message,
      isUserMessage: true,
      userId,
      fileId,
    },
  });

  // For YouTube, the context is simply the video URL (you can extend this with more metadata if desired)
  const contextData = `YouTube Video URL: ${file.url}`;

  // Retrieve previous conversation messages (if any)
  const prevMessages = await db.message.findMany({
    where: { fileId },
    orderBy: { createdAt: "asc" },
    take: 6,
  });
  const formattedPrevMessages = prevMessages.map((msg: Message) => ({
    role: msg.isUserMessage ? "user" : "assistant",
    content: msg.text,
  }));

  // Define the system prompt specifically for YouTube context
  const systemPrompt =
    "You are assisting a user with questions about a YouTube video. Use the provided video URL for context.";

  // Combine context, previous conversation, and user input into one prompt.
  // The type assertion helps TypeScript understand that the objects conform to ChatCompletionMessageParam.
  const conversationPrompt = ([
    {
      role: "system",
      content: systemPrompt,
    },
    {
      role: "user",
      content: `Context:\n${contextData}\n\nPREVIOUS CONVERSATION:\n${formattedPrevMessages
        .map((m) => (m.role === "user" ? "User: " : "Assistant: ") + m.content)
        .join("\n")}\n\nUSER INPUT: ${message}`,
    },
  ] as ChatCompletionMessageParam[]);

  // Create a streaming response using OpenAI's chat API
  const response = await openai.chat.completions
    .create({
      model: "gpt-4o-mini", // Adjust model as needed
      temperature: 0,
      stream: true,
      messages: conversationPrompt,
    })
    .asResponse();

  // Stream the assistant's reply and save it to the database when complete
  const stream = OpenAIStream(new Response(response.body), {
    async onCompletion(completion) {
      await db.message.create({
        data: {
          text: completion,
          isUserMessage: false,
          fileId,
          userId,
        },
      });
    },
  });

  return new StreamingTextResponse(stream);
};