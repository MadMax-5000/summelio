import { db } from "@/db";
import { getPineconeIndex } from "@/lib/pinecone";
import { sendMessageValidator } from "@/lib/validators/SendMessageValidator";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { openai } from "@/lib/openai";
import { OpenAIStream, StreamingTextResponse } from "ai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions/completions";
import { OpenAIEmbeddings } from '@langchain/openai';
import { PineconeStore } from '@langchain/pinecone';

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

// Fetch transcript of a YouTube video
async function fetchVideoTranscript(videoId: string) {
  const apiUrl = `https://www.youtube.com/api/timedtext?lang=en&v=${videoId}`;

  const response = await fetch(apiUrl);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Transcript API error: ${response.status} - ${errorText}`);
  }

  const transcriptXml = await response.text();

  // Parse the XML response and extract text content
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(transcriptXml, "text/xml");
  const texts = Array.from(xmlDoc.getElementsByTagName("text")).map((node) =>
    node.textContent?.trim()
  );

  const transcript = texts.join(" ").substring(0, 2000); // Limit transcript length
  console.log(`Transcript: ${transcript}`); // Log transcript for verification

  return transcript;
}

// Build the context string including video metadata and transcript
async function buildVideoContext(
  videoId: string,
  videoUrl: string,
  API_KEY: string
) {
  const videoDetails = await fetchVideoDetails(videoId, API_KEY);

  let transcript = "Transcript not available.";
  try {
    transcript = await fetchVideoTranscript(videoId);
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
    } else {
      console.log('An unknown error occurred:', error);
    }
  }

  const contextData = `
YouTube Video URL: ${videoUrl}
Title: ${videoDetails.title}
Description: ${videoDetails.description}
Channel: ${videoDetails.channelTitle}
Published: ${videoDetails.publishedAt}
Transcript: ${transcript}
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

      // Initialize Pinecone and OpenAI embeddings
      const embeddings = new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY,
        model: "text-embedding-3-small",
      });

      const pineconeIndex = await getPineconeIndex();
      const vectorStore = new PineconeStore(embeddings, { pineconeIndex, namespace: file.id });

      // Perform similarity search for the user's message
      const results = await vectorStore.similaritySearch(message, 12);

      console.log(
        `Similarity search for "${message.substring(0, 50)}..." returned ${results.length} results`
      );
      if (results.length > 0) {
        console.log(`Sample content: "${results[0].pageContent.substring(0, 100)}..."`);
      } else {
        console.log('No matching content found in the vector store');
      }

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
        "Use the provided video metadata (URL, title, description, channel, published date), " +
        "any previous conversation context, and any relevant information from vector search results to answer the user's question in markdown format. " +
        "If you don't know the answer, simply say so.";

      // Construct conversation prompt with vector search results
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
${results.length > 0
              ? `VECTOR SEARCH RESULTS:
${results
                .map((r, i) => `[Result ${i + 1}]: ${r.pageContent.trim()}`)
                .join('\n\n')}`
              : 'No relevant vector search results found.'}
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