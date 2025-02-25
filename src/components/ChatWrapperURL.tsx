import { redis } from "@/lib/redis";
import { ChatWrapperURLWrapper } from "./ChatWrapperURLWrapper";
import { cookies } from "next/headers";
import { ragChat } from "@/lib/rag-chat";

interface ChatWrapperURLProps {
  url: string;
}

const ChatWrapperURL = async ({ url }: ChatWrapperURLProps) => {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("sessionId")?.value;
  const sessionId = (url + "--" + sessionCookie).replace(/\//g, "");
  const isAlreadyIndexed = await redis.sismember("indexed-urls", url);
  const initialMessages = await ragChat.history.getMessages({
    amount: 10,
    sessionId,
  });
  if (!isAlreadyIndexed) {
    await ragChat.context.add({
      type: "html",
      source: url,
      config: { chunkOverlap: 50, chunkSize: 200 },
    });
    await redis.sadd("indexed-urls", url);
  }
  return (
    <ChatWrapperURLWrapper
      sessionId={sessionId}
      initialMessages={initialMessages}
    />
  );
};

export default ChatWrapperURL;
