import { db } from "@/db";
import { getUpStachIndex } from "@/lib/upstach";
import { sendMessageValidator } from "@/lib/validators/SendMessageValidator";
import { currentUser } from "@clerk/nextjs/server";
import { OpenAIEmbeddings } from "@langchain/openai";
import { NextRequest } from "next/server";
import { openai } from "@/lib/openai";
import { UpstashVectorStore } from "@langchain/community/vectorstores/upstash";
import { OpenAIStream, StreamingTextResponse } from "ai";

interface Message {
  isUserMessage: boolean;
  text: string;
}

export const POST = async (req: NextRequest) => {
  // Endpoint for asking a question to a PDF file
  const body = await req.json();
  const user = await currentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  const userId = user.id;
  const { fileId, message } = sendMessageValidator.parse(body);
  const file = await db.file.findFirst({
    where: {
      id: fileId,
      userId,
    },
  });
  if (!file) return new Response("File not found", { status: 404 });
  await db.message.create({
    data: {
      text: message,
      isUserMessage: true,
      userId,
      fileId,
    },
  });

  // Vectorize message
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
    model: "text-embedding-3-small",
    dimensions: 1024,
  });
  const UpstachIndex = getUpStachIndex();

  const vectorStore = new UpstashVectorStore(embeddings, {
    index: UpstachIndex,
  });

  const results = await vectorStore.similaritySearch(message, 4);
  const prevMessages = await db.message.findMany({
    where: {
      fileId,
    },
    orderBy: {
      createdAt: "asc",
    },
    take: 6,
  });
  const formattedPrevMessages = prevMessages.map((msg: Message) => ({
    role: msg.isUserMessage ? ("user" as const) : ("assistant" as const),
    content: msg.text,
  }));
  const response = await openai.chat.completions
    .create({
      model: "gpt-4o-mini",
      temperature: 0,
      stream: true,
      messages: [
        {
          role: "system",
          content:
            "Use the following pieces of context (or previous conversation if needed) to answer the user's question in markdown format.",
        },
        {
          role: "user",
          content: `Use the following pieces of context (or previous conversation if needed) to answer the user's question in markdown format. \nIf you don't know the answer, just say that you don't know; don't try to make up an answer.
          
  \n----------------\n
  
  PREVIOUS CONVERSATION:
  ${formattedPrevMessages
    .map((message) => {
      if (message.role === "user") return `User: ${message.content}\n`;
      return `Assistant: ${message.content}\n`;
    })
    .join("")}
  
  \n----------------\n
  
  CONTEXT:
  ${results.map((r) => r.pageContent).join("\n\n")}
  
  USER INPUT: ${message}`,
        },
      ],
    })
    .asResponse(); // Convert to Response object

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
