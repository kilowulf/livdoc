"use client";

import { trpc } from "@/app/_trpc/client";
import ChatInput from "./ChatInput";
import Messages from "./Messages";
import { ChevronLeft, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "../ui/button";
import { ChatContextProvider } from "./ChatContext";

/**
 * `ChatWrapperProps` defines the properties for the `ChatWrapper` component.
 * - `fileId`: The ID of the file being processed or used in the chat interface.
 * - `isSubscribed`: A boolean flag indicating whether the user is subscribed to a premium plan.
 */
interface ChatWrapperProps {
  fileId: string;
  isSubscribed: boolean;
}

/**
 * `ChatWrapper` component manages the chat interface for a specific file.
 * It handles different states like loading, processing, or failure depending on the file's status.
 * It provides the chat interface once the file is ready for interaction.
 */
const ChatWrapper = ({ fileId, isSubscribed }: ChatWrapperProps) => {
  // Fetch the file upload status using TRPC's `useQuery` hook, which periodically refetches the status until it is "SUCCESS" or "FAILED".
  const { data, isLoading } = trpc.getFileUploadStatus.useQuery(
    {
      fileId // Query the status for the given fileId
    },
    {
      // Refetch the data every 500ms unless the status is "SUCCESS" or "FAILED"
      refetchInterval: (data) =>
        data?.status === "SUCCESS" || data?.status === "FAILED" ? false : 500
    }
  );

  // Render loading UI when the query is still fetching the file status.
  if (isLoading)
    return (
      <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
        {/* Loading spinner and message indicating the file is being prepared */}
        <div className="flex-1 flex justify-center items-center flex-col mb-28">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />{" "}
            {/* Spinner */}
            <h3 className="font-semibold text-xl">Loading...</h3>
            <p className="text-zinc-500 text-sm">
              We&apos;re preparing your PDF.
            </p>
          </div>
        </div>

        {/* Disabled chat input while loading */}
        <ChatInput isDisabled />
      </div>
    );

  // Render processing UI if the file status is "PROCESSING".
  if (data?.status === "PROCESSING")
    return (
      <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
        {/* Spinner and message indicating that the file is still processing */}
        <div className="flex-1 flex justify-center items-center flex-col mb-28">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />{" "}
            {/* Spinner */}
            <h3 className="font-semibold text-xl">Processing PDF...</h3>
            <p className="text-zinc-500 text-sm">This won&apos;t take long.</p>
          </div>
        </div>

        {/* Disabled chat input while processing */}
        <ChatInput isDisabled />
      </div>
    );

  // Render failure UI if the file upload or processing fails.
  if (data?.status === "FAILED")
    return (
      <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
        {/* Failure message indicating the PDF has too many pages */}
        <div className="flex-1 flex justify-center items-center flex-col mb-28">
          <div className="flex flex-col items-center gap-2">
            <XCircle className="h-8 w-8 text-red-500" /> {/* Red error icon */}
            <h3 className="font-semibold text-xl">Too many pages in PDF</h3>
            <p className="text-zinc-500 text-sm">
              {/* Display plan details based on the subscription status */}
              Your{" "}
              <span className="font-medium">
                {isSubscribed ? "Pro" : "Free"}
              </span>{" "}
              plan supports up to{" "}
              {isSubscribed
                ? PLANS.find((p) => p.name === "Pro")?.pagesPerPdf
                : PLANS.find((p) => p.name === "Free")?.pagesPerPdf}{" "}
              pages per PDF.
            </p>
            {/* Link to navigate back to the dashboard */}
            <Link
              href="/dashboard"
              className={buttonVariants({
                variant: "secondary",
                className: "mt-4"
              })}
            >
              <ChevronLeft className="h-3 w-3 mr-1.5" /> {/* Back arrow icon */}
              Back
            </Link>
          </div>
        </div>

        {/* Disabled chat input when file upload fails */}
        <ChatInput isDisabled />
      </div>
    );

  // When the file is successfully processed, render the chat interface.
  return (
    // Wrap the chat components in `ChatContextProvider` to manage the chat state for the file.
    <ChatContextProvider fileId={fileId}>
      <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
        {/* Message list and chat input are rendered once the file is ready */}
        <div className="flex-1 justify-between flex flex-col mb-28">
          {/* Render the chat messages */}
          <Messages fileId={fileId} />
        </div>

        {/* Render the chat input for sending new messages */}
        <ChatInput />
      </div>
    </ChatContextProvider>
  );
};

export default ChatWrapper;
