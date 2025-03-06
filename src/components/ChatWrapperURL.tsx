import { redis } from "@/lib/redis";
import { ChatWrapperURLWrapper } from "./ChatWrapperURLWrapper";
import { cookies } from "next/headers";
import { ragChat } from "@/lib/rag-chat";
import { db } from "@/db";

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
    // Add URL content to the indexing context
    await ragChat.context.add({
      type: "html",
      source: url,
      config: { chunkOverlap: 50, chunkSize: 200 },
    });
    await redis.sadd("indexed-urls", url);

    // TIP: After indexing is done, update the file status to SUCCESS.
    await db.file.updateMany({
      where: {
        url: url,
        type: "URL",
      },
      data: {
        uploadStatus: "SUCCESS",
      },
    });
  }

  return (
    <ChatWrapperURLWrapper
      sessionId={sessionId}
      initialMessages={initialMessages}
    />
  );
};

export default ChatWrapperURL;
