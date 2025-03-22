import { Pinecone } from '@pinecone-database/pinecone';

const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
});

export async function getPineconeIndex() {
    return pinecone.index(process.env.PINECONE_INDEX!);
}
