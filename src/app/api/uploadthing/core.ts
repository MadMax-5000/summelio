import { db } from "@/db";
import { currentUser } from "@clerk/nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { PineconeStore } from '@langchain/pinecone';
import { getPineconeIndex } from '@/lib/pinecone';
import { Document } from '@langchain/core/documents';
import { OpenAIEmbeddings } from "@langchain/openai";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import os from "os";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();
const f = createUploadthing();

const UPLOAD_LIMITS = {
  PRO: 20,
  BUSINESS: 1000,
} as const;

export const ourFileRouter = {
  fileuploader: f({
    pdf: {
      maxFileSize: "16MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      const user = await currentUser();
      if (!user || !user.id) throw new Error("Unauthorized");

      const dbUser = await db.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          monthlyPdfUploads: true,
          lastUploadReset: true,
          lemonSqueezyPriceId: true,
          lemonSqueezyCurrentPeriodEnd: true,
        },
      });

      if (!dbUser) throw new Error("User not found");

      const hasActiveSubscription = dbUser.lemonSqueezyCurrentPeriodEnd
        ? new Date(dbUser.lemonSqueezyCurrentPeriodEnd) > new Date()
        : false;

      if (!hasActiveSubscription) {
        throw new Error("Please subscribe to a plan to upload PDFs.");
      }

      const now = new Date();
      const lastReset = new Date(dbUser.lastUploadReset);
      if (lastReset.getMonth() !== now.getMonth() || lastReset.getFullYear() !== now.getFullYear()) {
        await db.user.update({
          where: { id: user.id },
          data: {
            monthlyPdfUploads: 0,
            lastUploadReset: now,
          },
        });
        dbUser.monthlyPdfUploads = 0;
      }

      const uploadLimit = dbUser.lemonSqueezyPriceId === "729862"
        ? UPLOAD_LIMITS.BUSINESS
        : UPLOAD_LIMITS.PRO;

      if (dbUser.monthlyPdfUploads >= uploadLimit) {
        throw new Error(`Monthly PDF upload limit (${uploadLimit}) reached. ${uploadLimit === UPLOAD_LIMITS.PRO
          ? "Please upgrade to our Business plan for more uploads or wait until next month."
          : "Please wait until next month to upload more PDFs."
          }`);
      }

      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await db.user.update({
        where: { id: metadata.userId },
        data: { monthlyPdfUploads: { increment: 1 } },
      });

      const createdFile = await db.file.create({
        data: {
          key: file.key,
          name: file.name,
          userId: metadata.userId,
          url: `https://uploadthing-prod.s3.us-west-2.amazonaws.com/${file.key}`,
          uploadStatus: "PROCESSING",
          type: "pdf",
        },
      });

      try {
        console.log(`Starting to process PDF: ${file.name}`);
        const fileData = await utapi.getSignedURL(file.key);

        if (!fileData || !fileData.url) throw new Error(`Could not retrieve file data for key: ${file.key}`);

        const response = await fetch(fileData.url);
        if (!response.ok) throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        console.log(`PDF downloaded, size: ${buffer.length} bytes`);

        const tempFilePath = join(os.tmpdir(), `pdf-${file.key}.pdf`);
        await writeFile(tempFilePath, buffer);
        console.log(`Temp file created at: ${tempFilePath}`);

        const loader = new PDFLoader(tempFilePath, { splitPages: true });
        console.log("Loading PDF pages...");
        const pageLevelDocs = await loader.load();
        console.log(`PDF loaded successfully. Pages found: ${pageLevelDocs.length}`);

        await unlink(tempFilePath);
        console.log("Temporary file deleted");

        const embeddings = new OpenAIEmbeddings({
          openAIApiKey: process.env.OPENAI_API_KEY,
          model: "text-embedding-3-small",
        });

        const pineconeIndex = await getPineconeIndex();
        const vectorStore = new PineconeStore(embeddings, { pineconeIndex, namespace: createdFile.id });

        // Filter valid pages with original indices
        const validPages = pageLevelDocs
          .map((doc, index) => ({ doc, index }))
          .filter(({ doc }) => doc.pageContent && doc.pageContent.trim() !== "");

        if (validPages.length === 0) {
          console.log('No valid pages to index');
          throw new Error("No valid pages to index");
        }

        // Batch generate embeddings
        const pageContents = validPages.map(({ doc }) => doc.pageContent);
        console.log(`Generating embeddings for ${validPages.length} pages...`);
        const embeddingsArray = await embeddings.embedDocuments(pageContents);
        console.log(`Embeddings generated successfully.`);

        // Prepare vectors and documents
        const vectors: number[][] = embeddingsArray;
        const documents: Document[] = validPages.map(({ doc, index }) => {
          const updatedMetadata = {
            ...doc.metadata,
            pageNumber: index + 1,
            fileId: createdFile.id,
            fileName: file.name,
          };
          return new Document({
            pageContent: doc.pageContent,
            metadata: updatedMetadata,
          });
        });

        // Index all vectors at once
        try {
          await vectorStore.addVectors(vectors, documents);
          console.log(`Successfully indexed ${vectors.length} pages`);
          await db.file.update({
            data: { uploadStatus: "SUCCESS" },
            where: { id: createdFile.id },
          });
        } catch (indexError) {
          console.error("Error indexing vectors:", indexError);
          throw indexError;
        }

        console.log(`File processing completed successfully: ${file.name}`);
      } catch (err) {
        console.error("Error processing file:", err);
        await db.file.update({
          data: { uploadStatus: "FAILED" },
          where: { id: createdFile.id },
        });
      }
    }),

  urluploader: f({})
    .middleware(async ({ req }) => {
      const user = await currentUser();
      if (!user || !user.id) throw new Error("UNAUTHORIZED");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata }) => {
      return { success: true };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;