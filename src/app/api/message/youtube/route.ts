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
  console.log(`[DEBUG] Attempting to extract video ID from URL: ${url}`);
  const regExp =
    /(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regExp);

  if (match) {
    console.log(`[DEBUG] Successfully extracted video ID: ${match[1]}`);
    return match[1];
  } else {
    console.error(`[ERROR] Failed to extract video ID from URL: ${url}`);
    return null;
  }
}

// Fetch YouTube video details using the YouTube Data API
async function fetchVideoDetails(videoId: string, API_KEY: string) {
  console.log(`[DEBUG] Fetching video details for ID: ${videoId}`);
  const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${API_KEY}`;

  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[ERROR] YouTube API responded with status ${response.status}: ${errorText}`
      );
      throw new Error(`YouTube API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      console.error(`[ERROR] Video data not found for ID: ${videoId}`);
      throw new Error("Video not found");
    }

    console.log(
      `[DEBUG] Successfully fetched video details. Title: "${data.items[0].snippet.title}"`
    );
    const snippet = data.items[0].snippet;
    return {
      title: snippet.title,
      description: snippet.description,
      channelTitle: snippet.channelTitle,
      publishedAt: snippet.publishedAt,
    };
  } catch (error) {
    console.error(`[ERROR] Error fetching video details:`, error);
    throw error;
  }
}

// Build the context string including video metadata
async function buildVideoContext(
  videoId: string,
  videoUrl: string,
  API_KEY: string
) {
  console.log(`[DEBUG] Building video context for ID: ${videoId}`);
  try {
    const videoDetails = await fetchVideoDetails(videoId, API_KEY);
    const contextData = `
YouTube Video URL: ${videoUrl}
Title: ${videoDetails.title}
Description: ${videoDetails.description}
Channel: ${videoDetails.channelTitle}
Published: ${videoDetails.publishedAt}
    `.trim();

    console.log(
      `[DEBUG] Successfully built video context. Context length: ${contextData.length} characters`
    );
    return contextData;
  } catch (error) {
    console.error(`[ERROR] Error building video context:`, error);
    throw error;
  }
}

export const POST = async (req: NextRequest) => {
  console.log(`[DEBUG] Received POST request to YouTube message endpoint`);

  try {
    // Parse request body and validate input
    const body = await req.json();
    const user = await currentUser();

    if (!user) {
      console.error(`[ERROR] Unauthorized request - no user found`);
      return new Response("Unauthorized", { status: 401 });
    }

    const userId = user.id;
    console.log(`[DEBUG] Processing request for user: ${userId}`);

    try {
      const { fileId, message } = sendMessageValidator.parse(body);
      console.log(
        `[DEBUG] Validated input. FileID: ${fileId}, Message length: ${message.length}`
      );

      // Fetch the file and ensure it's a YouTube file
      const file = await db.file.findFirst({
        where: { id: fileId, userId },
      });

      if (!file) {
        console.error(
          `[ERROR] File not found. FileID: ${fileId}, UserID: ${userId}`
        );
        return new Response("File not found", { status: 404 });
      }

      if (file.type !== "youtube") {
        console.error(
          `[ERROR] Invalid file type: ${file.type}. Expected: youtube`
        );
        return new Response("Invalid file type for this endpoint", {
          status: 400,
        });
      }

      console.log(`[DEBUG] Found valid YouTube file. URL: ${file.url}`);

      // Save the user's message
      await db.message.create({
        data: { text: message, isUserMessage: true, userId, fileId },
      });
      console.log(`[DEBUG] Saved user message to database`);

      // Validate the YouTube API key
      const API_KEY = process.env.YOUTUBE_API_KEY;
      if (!API_KEY) {
        console.error(
          `[ERROR] YouTube API key is missing from environment variables`
        );
        return new Response("YouTube API key is missing", { status: 500 });
      }

      // Extract video ID from the file's URL
      const videoId = extractVideoId(file.url);
      if (!videoId) {
        console.error(`[ERROR] Invalid YouTube URL: ${file.url}`);
        return new Response("Invalid YouTube URL", { status: 400 });
      }

      const videoUrl = file.url;

      // Retrieve previous conversation messages
      const prevMessages = await db.message.findMany({
        where: { fileId },
        orderBy: { createdAt: "asc" },
        take: 6,
      });
      console.log(`[DEBUG] Retrieved ${prevMessages.length} previous messages`);

      const formattedPrevMessages = prevMessages.map((msg: Message) => ({
        role: msg.isUserMessage ? "user" : "assistant",
        content: msg.text,
      }));

      // Build the YouTube video context
      console.log(`[DEBUG] Building video context...`);
      let videoContext;
      try {
        videoContext = await buildVideoContext(videoId, videoUrl, API_KEY);
      } catch (error: any) {
        console.error(`[ERROR] Failed to build video context:`, error);
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

      console.log(
        `[DEBUG] Created OpenAI prompt. Total context length: ${
          JSON.stringify(conversationPrompt).length
        }`
      );

      // Create streaming response using OpenAI's chat API
      console.log(`[DEBUG] Sending request to OpenAI with model: gpt-4o-mini`);
      try {
        const response = await openai.chat.completions
          .create({
            model: "gpt-4o-mini", // Adjust model as needed
            temperature: 0,
            stream: true,
            messages: conversationPrompt,
          })
          .asResponse();

        console.log(`[DEBUG] Received streaming response from OpenAI`);

        // Stream the assistant's reply and save it to the database on completion
        const stream = OpenAIStream(new Response(response.body), {
          async onCompletion(completion) {
            console.log(
              `[DEBUG] Stream completed. Response length: ${completion.length}`
            );
            await db.message.create({
              data: { text: completion, isUserMessage: false, fileId, userId },
            });
            console.log(`[DEBUG] Saved assistant response to database`);
          },
        });

        return new StreamingTextResponse(stream);
      } catch (error: any) {
        console.error(`[ERROR] OpenAI API error:`, error);
        return new Response(`Error from OpenAI API: ${error.message}`, {
          status: 500,
        });
      }
    } catch (validationError: any) {
      console.error(`[ERROR] Validation error:`, validationError);
      return new Response(`Validation error: ${validationError.message}`, {
        status: 400,
      });
    }
  } catch (error: any) {
    console.error(`[ERROR] Unhandled error in route handler:`, error);
    return new Response(`Server error: ${error.message}`, { status: 500 });
  }
};
