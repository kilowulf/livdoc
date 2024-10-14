/**
 * Dashboard Component:
 * This component renders a user's dashboard, displaying a list of uploaded files and providing
 * functionalities to upload, view, and delete files. It interacts with an API through TRPC to fetch
 * user files and handle file deletion. The component includes a conditional display, showing
 * either a list of files, a loading skeleton, or a message indicating no files are present.
 */

"use client";

import { trpc } from "@/app/_trpc/client";
import UploadButton from "./UploadButton";
import { Ghost, Loader2, MessageSquare, Plus, Trash } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "./ui/button";
import { useState } from "react";
import { getUserSubscriptionPlan } from "@/lib/stripe";

interface PageProps {
  subscriptionPlan: Awaited<ReturnType<typeof getUserSubscriptionPlan>>;
}

const Dashboard = ({ subscriptionPlan }: PageProps) => {
  // State to manage currently deleting file's ID, set to null initially
  const [currentlyDeletingFile, setCurrentlyDeletingFile] = useState<
    string | null
  >(null);

  // TRPC context for re-fetching data after mutations
  const utils = trpc.useUtils();

  // Fetch user files data and loading status with TRPC
  const { data: files, isLoading } = trpc.getUserFiles.useQuery();
  console.log(subscriptionPlan.name);

  // Mutation to delete a file, updating file list upon success and managing delete state
  const { mutate: deleteFile } = trpc.deleteFile.useMutation({
    onSuccess: () => {
      // Invalidate and refetch the file list after a successful deletion
      utils.getUserFiles.invalidate();
    },
    onMutate({ id }) {
      // Set the file ID being deleted to show loading indicator
      setCurrentlyDeletingFile(id);
    },
    onSettled() {
      // Reset delete state once mutation is complete
      setCurrentlyDeletingFile(null);
    }
  });

  return (
    <main className="mx-auto max-w-7xl md:p-10">
      {/* Header Section with Upload Button */}
      <div className="mt-8 flex flex-col items-start justify-between gap-4 border-b border-gray-500 pb-5 sm:flex-row sm:items-center sm:gap-0">
        <h1 className="mb-3 font-bold text-5xl text-gray-100">
          <span className="text-blue-500">My</span> documents
          <span className="text-blue-500">:</span>
        </h1>
        {/* Decorative Background Blob */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        >
          <div
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"
            }}
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          />
        </div>

        {/* Button to Upload a New File */}
        <UploadButton isSubscribed={subscriptionPlan.isSubscribed} />
      </div>

      {/* Display of Files, Loading State, or Empty State Message */}
      {files && files?.length !== 0 ? (
        // Render files as a grid of cards if files exist
        <ul className="mt-8 grid grid-cols-1 gap-6 divide-zinc-100 md:grid-cols-2 lg:grid-cols-3">
          {files
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .map((file) => (
              <li
                key={file.id}
                className="col-span-1 divide-y divide-gray-500 rounded-lg bg-purple-300 bg-opacity-10 shadow transition hover:shadow-lg"
              >
                <Link
                  href={`/dashboard/${file.id}`}
                  className="flex flex-col gap-2"
                >
                  <div className="pt-6 px-6 flex w-full items-center justify-between space-x-6">
                    {/* File Icon */}
                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-700" />
                    {/* File Name */}
                    <div className="flex-1 truncate">
                      <div className="flex items-center space-x-3">
                        <h3 className="truncate text-lg font-semibold text-zinc-400">
                          {file.name}
                        </h3>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* File Details and Delete Button */}
                <div className="px-6 mt-4 grid grid-cols-3 place-items-center py-2 gap-6 text-xs text-zinc-400">
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    {format(new Date(file.createdAt), "MMM yyyy")}
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    mocked
                  </div>
                  {/* Delete button with loading spinner */}
                  <Button
                    onClick={() => deleteFile({ id: file.id })}
                    size="sm"
                    className="w-full"
                    variant="dashTrash"
                  >
                    {currentlyDeletingFile === file.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </li>
            ))}
        </ul>
      ) : isLoading ? (
        // Render loading skeleton if files are loading
        <Skeleton height={100} className="my-2" count={3} />
      ) : (
        // Render empty state if no files are present
        <div className="mt-16 flex flex-col items-center gap-2">
          <Ghost className="h-8 w-8 text-zinc-500" />
          <h3 className="font-semibold text-xl">
            No documents currently uploaded
          </h3>
          <p>Let&apos;s upload your first PDF.</p>
        </div>
      )}
    </main>
  );
};

export default Dashboard;
