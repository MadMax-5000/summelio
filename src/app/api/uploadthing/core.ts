import { db } from "@/db";
import { currentUser } from "@clerk/nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { getUpStachIndex } from "@/lib/upstach";
import { OpenAIEmbeddings } from "@langchain/openai";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import os from "os";
import { UTApi } from "uploadthing/server";

// Create UploadThing API instance for direct file access
const utapi = new UTApi();

const f = createUploadthing();

// Update constants to remove FREE tier
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

      // Get user from database with subscription info
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

      // Check if user has an active subscription
      const hasActiveSubscription = dbUser.lemonSqueezyCurrentPeriodEnd
        ? new Date(dbUser.lemonSqueezyCurrentPeriodEnd) > new Date()
        : false;

      if (!hasActiveSubscription) {
        throw new Error("Please subscribe to a plan to upload PDFs.");
      }

      // Check if we need to reset monthly counter
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

      // Check if user has reached their limit
      if (dbUser.monthlyPdfUploads >= uploadLimit) {
        throw new Error(`Monthly PDF upload limit (${uploadLimit}) reached. ${uploadLimit === UPLOAD_LIMITS.PRO
            ? "Please upgrade to our Business plan for more uploads or wait until next month."
            : "Please wait until next month to upload more PDFs."
          }`);
      }

      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // First increment the upload counter
      await db.user.update({
        where: { id: metadata.userId },
        data: {
          monthlyPdfUploads: {
            increment: 1
          }
        }
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

        // Get the file directly from UploadThing using the SDK
        // This avoids the 403 error we were getting
        const fileData = await utapi.getSignedURL(file.key);

        if (!fileData || !fileData.url) {
          throw new Error(`Could not retrieve file data for key: ${file.key}`);
        }

        // Use the signed URL from the SDK
        const response = await fetch(fileData.url);

        if (!response.ok) {
          throw new Error(
            `Failed to fetch PDF: ${response.status} ${response.statusText}`
          );
        }

        // Get the PDF as an ArrayBuffer
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        console.log(`PDF downloaded, size: ${buffer.length} bytes`);

        // Create a temporary file
        const tempFilePath = join(os.tmpdir(), `pdf-${file.key}.pdf`);
        await writeFile(tempFilePath, buffer);
        console.log(`Temp file created at: ${tempFilePath}`);

        // Use PDFLoader with the temp file
        const loader = new PDFLoader(tempFilePath, {
          splitPages: true,
        });

        console.log("Loading PDF pages...");
        const pageLevelDocs = await loader.load();
        console.log(
          `PDF loaded successfully. Pages found: ${pageLevelDocs.length}`
        );

        // Clean up temp file
        await unlink(tempFilePath);
        console.log("Temporary file deleted");

        // Get vector index
        const upstachIndex = getUpStachIndex();
        const embeddings = new OpenAIEmbeddings({
          openAIApiKey: process.env.OPENAI_API_KEY,
          model: "text-embedding-3-small",
          dimensions: 1024,
        });

        // Process documents and create embeddings
        console.log("Starting to process embeddings...");
        for (let i = 0; i < pageLevelDocs.length; i++) {
          const doc = pageLevelDocs[i];

          if (!doc.pageContent || doc.pageContent.trim() === "") {
            console.log(`Skipping page ${i + 1} - empty content`);
            continue;
          }

          console.log(`Processing page ${i + 1}/${pageLevelDocs.length}`);
          try {
            const embedding = await embeddings.embedQuery(doc.pageContent);

            await upstachIndex.upsert({
              id: `${file.key}-page-${i + 1}`,
              vector: embedding,
              metadata: {
                pageNumber: i + 1,
                fileId: createdFile.id,
                fileName: file.name,
                pageContent: doc.pageContent.substring(0, 1000),
                ...doc.metadata,
              },
            });
            console.log(`Successfully indexed page ${i + 1}`);
          } catch (embeddingError) {
            console.error(`Error processing page ${i + 1}:`, embeddingError);
          }
        }

        await db.file.update({
          data: {
            uploadStatus: "SUCCESS",
          },
          where: {
            id: createdFile.id,
          },
        });
        console.log(`File processing completed successfully: ${file.name}`);
      } catch (err) {
        console.error("Error processing file:", err);
        await db.file.update({
          data: {
            uploadStatus: "FAILED",
          },
          where: {
            id: createdFile.id,
          },
        });
      }
    }),

  // endpoint for URL handling
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
