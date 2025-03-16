import { db } from "@/db";
import { sendMessageValidator } from "@/lib/validators/SendMessageValidator";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { openai } from "@/lib/openai";
import { OpenAIStream, StreamingTextResponse } from "ai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions/completions";

interface Message {
  isUserMessage: boolean;
  text: string;
}

// Helper: Extract video ID from a YouTube URL.
function extractVideoId(url: string): string | null {
  const regExp =
    /(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regExp);

  return match ? match[1] : null;
}

// Fetch YouTube video details using the YouTube Data API
async function fetchVideoDetails(videoId: string, API_KEY: string) {
  const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${API_KEY}`;

  const response = await fetch(apiUrl);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`YouTube API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  if (!data.items || data.items.length === 0) {
    throw new Error("Video not found");
  }

  const snippet = data.items[0].snippet;
  return {
    title: snippet.title,
    description: snippet.description,
    channelTitle: snippet.channelTitle,
    publishedAt: snippet.publishedAt,
  };
}

// Build the context string including video metadata
async function buildVideoContext(
  videoId: string,
  videoUrl: string,
  API_KEY: string
) {
  const videoDetails = await fetchVideoDetails(videoId, API_KEY);
  const contextData = `
YouTube Video URL: ${videoUrl}
Title: ${videoDetails.title}
Description: ${videoDetails.description}
Channel: ${videoDetails.channelTitle}
Published: ${videoDetails.publishedAt}
  `.trim();

  return contextData;
}

export const POST = async (req: NextRequest) => {
  try {
    // Parse request body and validate input
    const body = await req.json();
    const user = await currentUser();

    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const userId = user.id;

    try {
      const { fileId, message } = sendMessageValidator.parse(body);

      // Fetch the file and ensure it's a YouTube file
      const file = await db.file.findFirst({
        where: { id: fileId, userId },
      });

      if (!file) {
        return new Response("File not found", { status: 404 });
      }

      if (file.type !== "Youtube Video") {
        return new Response("Invalid file type for this endpoint", {
          status: 400,
        });
      }

      // Save the user's message
      await db.message.create({
        data: { text: message, isUserMessage: true, userId, fileId },
      });

      // Validate the YouTube API key
      const API_KEY = process.env.YOUTUBE_API_KEY;
      if (!API_KEY) {
        return new Response("YouTube API key is missing", { status: 500 });
      }

      // Extract video ID from the file's URL
      const videoId = extractVideoId(file.url);
      if (!videoId) {
        return new Response("Invalid YouTube URL", { status: 400 });
      }

      const videoUrl = file.url;

      // Retrieve previous conversation messages
      const prevMessages = await db.message.findMany({
        where: { fileId },
        orderBy: { createdAt: "asc" },
        take: 6,
      });

      const formattedPrevMessages = prevMessages.map((msg: Message) => ({
        role: msg.isUserMessage ? "user" : "assistant",
        content: msg.text,
      }));

      // Build the YouTube video context
      let videoContext;
      try {
        videoContext = await buildVideoContext(videoId, videoUrl, API_KEY);
      } catch (error: any) {
        return new Response(`Error building video context: ${error.message}`, {
          status: 500,
        });
      }

      // Define system prompt
      const systemPrompt =
        "You are an expert assistant specialized in analyzing YouTube videos. " +
        "Use the provided video metadata (URL, title, description, channel, published date) " +
        "and any previous conversation context to answer the user's question in markdown format. " +
        "If you don't know the answer, simply say so.";

      // Construct conversation prompt
      const conversationPrompt = [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `----------------
PREVIOUS CONVERSATION:
${formattedPrevMessages
  .map((m) =>
    m.role === "user" ? `User: ${m.content}` : `Assistant: ${m.content}`
  )
  .join("\n")}
----------------
YOUTUBE VIDEO CONTEXT:
${videoContext}
----------------
USER INPUT: ${message}`,
        },
      ] as ChatCompletionMessageParam[];

      // Create streaming response using OpenAI's chat API
      try {
        const response = await openai.chat.completions
          .create({
            model: "gpt-4o-mini", // Adjust model as needed
            temperature: 0,
            stream: true,
            messages: conversationPrompt,
          })
          .asResponse();

        // Stream the assistant's reply and save it to the database on completion
        const stream = OpenAIStream(new Response(response.body), {
          async onCompletion(completion) {
            await db.message.create({
              data: { text: completion, isUserMessage: false, fileId, userId },
            });
          },
        });

        return new StreamingTextResponse(stream);
      } catch (error: any) {
        return new Response(`Error from OpenAI API: ${error.message}`, {
          status: 500,
        });
      }
    } catch (validationError: any) {
      return new Response(`Validation error: ${validationError.message}`, {
        status: 400,
      });
    }
  } catch (error: any) {
    return new Response(`Server error: ${error.message}`, { status: 500 });
  }
};