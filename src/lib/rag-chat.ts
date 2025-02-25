import { ChatOpenAI, RAGChat } from "@upstash/rag-chat";
import { redis } from "./redis";

export const ragChat = new RAGChat({
  redis: redis,
  model: new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  }),
});
