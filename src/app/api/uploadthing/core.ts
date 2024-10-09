// General overview:
// This code defines a file upload handler for a Next.js application, involving PDF upload processing, user authentication, and indexing with Pinecone for vectorized search. It includes middleware for user session verification and upload completion logic for managing file metadata, loading, vectorizing, and indexing documents.

import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { pineconeClient } from "@/lib/pinecone";
import { getUserSubscriptionPlan } from "@/lib/stripe";
import { PLANS } from "@/config/stripe";

const f = createUploadthing();

// Middleware function to verify user session and retrieve subscription plan
const middleware = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  // Ensure the user is authenticated
  if (!user || !user.id) throw new Error("Unauthorized");

  // Retrieve user's subscription plan
  const subscriptionPlan = await getUserSubscriptionPlan();

  return { subscriptionPlan, userId: user.id };
};

// Handler function called upon upload completion
const onUploadComplete = async ({
  metadata,
  file
}: {
  metadata: Awaited<ReturnType<typeof middleware>>;
  file: { key: string; name: string; url: string };
}) => {
  // Check if file exists
  const isFileExist = await db.file.findFirst({
    where: {
      key: file.key
    }
  });

  if (isFileExist) return;

  // Store file metadata in the database and set initial upload status to "PROCESSING"
  const createdFile = await db.file.create({
    data: {
      key: file.key,
      name: file.name,
      userId: metadata.userId,
      url: `https://utfs.io/f/${file.key}`,
      uploadStatus: "PROCESSING"
    }
  });

  try {
    // Fetch the uploaded PDF file as a blob
    const response = await fetch(`https://utfs.io/f/${file.key}`);
    const blob = await response.blob();

    // Load PDF using PDFLoader to split it into pages
    const loader = new PDFLoader(blob);
    const pageLevelDocs = await loader.load();
    const pagesAmt = pageLevelDocs.length;

    // Retrieve subscription plan details from metadata
    const { subscriptionPlan } = metadata;
    const { isSubscribed } = subscriptionPlan;

    // Check if the uploaded document exceeds page limits based on subscription plan
    const isProExceeded =
      pagesAmt > PLANS.find((plan) => plan.name === "Pro")!.pagesPerPdf;
    const isFreeExceeded =
      pagesAmt > PLANS.find((plan) => plan.name === "Free")!.pagesPerPdf;

    if ((isSubscribed && isProExceeded) || (!isSubscribed && isFreeExceeded)) {
      await db.file.update({
        data: {
          uploadStatus: "FAILED"
        },
        where: {
          id: createdFile.id
        }
      });
    }

    // Vectorize document pages using OpenAI embeddings and index them using Pinecone
    const index = pineconeClient.Index("livdoc");
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY
    });

    await PineconeStore.fromDocuments(pageLevelDocs, embeddings, {
      pineconeIndex: index,
      namespace: createdFile.id
    });

    // Update the upload status to "SUCCESS" once vectorization and indexing are completed
    await db.file.update({
      data: {
        uploadStatus: "SUCCESS"
      },
      where: {
        id: createdFile.id
      }
    });
  } catch (err) {
    // Update the upload status to "FAILED" if an error occurs during processing
    await db.file.update({
      data: {
        uploadStatus: "FAILED"
      },
      where: {
        id: createdFile.id
      }
    });
  }
};

// Define the file router for handling different file types (e.g., PDF)
export const ourFileRouter = {
  freePlanUploader: f({ pdf: { maxFileSize: "4MB" } })
    .middleware(middleware)
    .onUploadComplete(onUploadComplete),
  proPlanUploader: f({ pdf: { maxFileSize: "16MB" } })
    .middleware(middleware)
    .onUploadComplete(onUploadComplete)
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
