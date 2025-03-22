import { db } from '@/db';
import { getPineconeIndex } from '@/lib/pinecone';
import { sendMessageValidator } from '@/lib/validators/SendMessageValidator';
import { currentUser } from '@clerk/nextjs/server';
import { OpenAIEmbeddings } from '@langchain/openai';
import { NextRequest } from 'next/server';
import { openai } from '@/lib/openai';
import { PineconeStore } from '@langchain/pinecone';
import { OpenAIStream, StreamingTextResponse } from 'ai';

interface Message {
  isUserMessage: boolean;
  text: string;
}

interface FormattedMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const POST = async (req: NextRequest) => {
  const body = await req.json();
  const user = await currentUser();
  if (!user) return new Response('Unauthorized', { status: 401 });
  const userId = user.id;
  const { fileId, message } = sendMessageValidator.parse(body);
  const file = await db.file.findFirst({
    where: {
      id: fileId,
      userId,
    },
  });
  if (!file) return new Response('File not found', { status: 404 });
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
  });

  const pineconeIndex = await getPineconeIndex();
  const vectorStore = new PineconeStore(embeddings, { pineconeIndex, namespace: file.id });

  const results = await vectorStore.similaritySearch(message, 12);

  console.log(
    `Similarity search for "${message.substring(0, 50)}..." returned ${results.length} results`
  );
  if (results.length > 0) {
    console.log(`Sample content: "${results[0].pageContent.substring(0, 100)}..."`);
    console.log(`From page ${results[0].metadata.pageNumber}`);
  } else {
    console.log('No matching content found in the document');
  }

  const prevMessages = await db.message.findMany({
    where: {
      fileId,
    },
    orderBy: {
      createdAt: 'asc',
    },
    take: 6,
  });
  const formattedPrevMessages = prevMessages.map((msg: Message) => ({
    role: msg.isUserMessage ? ('user' as const) : ('assistant' as const),
    content: msg.text,
  }));
  const response = await openai.chat.completions
    .create({
      model: 'gpt-4o-mini',
      temperature: 0.1,
      stream: true,
      messages: [
        {
          role: 'system',
          content:
            'You are an AI assistant that helps answer questions about PDF documents. Use the following pieces of context from the PDF to answer the user\'s question in markdown format. If the information is not found in the provided context, acknowledge that it might not be in the uploaded document. Always refer to the specific page numbers when citing information.',
        },
        {
          role: 'user',
          content: `Use the following pieces of context (or previous conversation if needed) to answer my question in markdown format. \nIf you don't know the answer, just say that you don't know; don't try to make up an answer.

  \n----------------\n

  PREVIOUS CONVERSATION:
  ${formattedPrevMessages
              .map((message: FormattedMessage) => {
                if (message.role === 'user') return `User: ${message.content}\n`;
                return `Assistant: ${message.content}\n`;
              })
              .join('')}

  \n----------------\n

  CONTEXT FROM PDF (${results.length} relevant sections):
${results.length > 0
              ? results
                .map(
                  (r, i) =>
                    `[Page ${r.metadata.pageNumber}]: ${r.pageContent.trim()}`
                )
                .join('\n\n')
              : 'No relevant content found in the document. The PDF might not contain information related to this query or there might be an issue with the document indexing.'
            }

\n----------------\n

  USER QUESTION: ${message}
  If the information to answer this question is not found in the PDF context provided, please state clearly: "The information about [topic] does not appear to be in the uploaded document."`,
        },
      ],
    })
    .asResponse();

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