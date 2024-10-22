"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";

import Dropzone from "react-dropzone";
import { Cloud, File, Loader2 } from "lucide-react";
import { Progress } from "./ui/progress";
import { useUploadThing } from "@/lib/uploadthing";
import { useToast } from "./ui/use-toast";
import { trpc } from "@/app/_trpc/client";
import { useRouter } from "next/navigation";

/**
 * UploadDropzone Component:
 * Handles the drag-and-drop interface for uploading files. It also manages the file upload process,
 * showing progress, and redirects the user after the upload is complete.
 * - Utilizes `react-dropzone` for handling drag-and-drop functionality.
 * - Calls `startUpload` to upload the file.
 * - Shows a progress bar during the upload and handles redirection to the dashboard after completion.
 */
const UploadDropzone = ({ isSubscribed }: { isSubscribed: boolean }) => {
  const router = useRouter(); // For navigating the user after file upload

  // State for managing upload progress and status
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const { toast } = useToast(); // Notification system

  // Selects the uploader based on whether the user is subscribed
  const { startUpload } = useUploadThing(
    isSubscribed ? "proPlanUploader" : "freePlanUploader"
  );

  // API call to get the file and trigger redirection after upload
  const { mutate: startPolling } = trpc.getFile.useMutation({
    onSuccess: (file) => {
      router.push(`/dashboard/${file.id}`); // Redirect to the file details page after upload
    },
    retry: true,
    retryDelay: 500
  });

  // Simulates file upload progress for a more engaging user experience
  const startSimulatedProgress = () => {
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prevProgress) => {
        if (prevProgress >= 95) {
          clearInterval(interval); // Stops progress once it reaches 95%
          return prevProgress;
        }
        return prevProgress + 5;
      });
    }, 500);

    return interval;
  };

  return (
    <Dropzone
      multiple={false} // Only allows a single file upload
      onDrop={async (acceptedFile) => {
        setIsUploading(true); // Show upload state

        const progressInterval = startSimulatedProgress(); // Start simulated progress bar

        // Handle file uploading
        const res = await startUpload(acceptedFile);

        if (!res) {
          return toast({
            title: "Something went wrong", // Show error if upload fails
            description: "Please try again later",
            variant: "destructive"
          });
        }

        const [fileResponse] = res;
        const key = fileResponse?.key; // Retrieve file key for further actions

        if (!key) {
          return toast({
            title: "Something went wrong",
            description: "Please try again later",
            variant: "destructive"
          });
        }

        clearInterval(progressInterval); // Clear progress simulation once upload completes
        setUploadProgress(100); // Set progress to 100%

        startPolling({ key }); // Start polling to fetch the uploaded file and redirect
      }}
    >
      {({ getRootProps, getInputProps, acceptedFiles }) => (
        <div
          {...getRootProps()}
          className="border h-64 m-4 border-dashed border-gray-200 rounded-lg"
        >
          <div className="flex items-center justify-center h-full w-full">
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-full rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
            >
              {/* Upload prompt */}
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Cloud className="h-6 w-6 text-zinc-500 mb-2" />
                <p className="mb-2 text-sm text-zinc-700">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-zinc-500">
                  PDF (up to {isSubscribed ? "16" : "4"}MB)
                </p>
              </div>

              {/* Display file name if a file is selected */}
              {acceptedFiles && acceptedFiles[0] ? (
                <div className="max-w-xs bg-white flex items-center rounded-md overflow-hidden outline outline-[1px] outline-zinc-200 divide-x divide-zinc-200">
                  <div className="px-3 py-2 h-full grid place-items-center">
                    <File className="h-4 w-4 text-blue-700" />
                  </div>
                  <div className="px-3 py-2 h-full text-sm text-blue-700 truncate">
                    {acceptedFiles[0].name}
                  </div>
                </div>
              ) : null}

              {/* Show progress bar during file upload */}
              {isUploading ? (
                <div className="w-full mt-4 max-w-xs mx-auto">
                  <Progress
                    indicatorColor={
                      uploadProgress === 100 ? "bg-green-500" : ""
                    }
                    value={uploadProgress}
                    className="h-1 w-full bg-zinc-200"
                  />
                  {uploadProgress === 100 ? (
                    <div className="flex gap-1 items-center justify-center text-sm text-zinc-700 text-center pt-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Redirecting...
                    </div>
                  ) : null}
                </div>
              ) : null}

              {/* Hidden input element for file selection */}
              <input
                {...getInputProps()}
                type="file"
                id="dropzone-file"
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}
    </Dropzone>
  );
};

/**
 * UploadButton Component:
 * Provides a button that triggers a modal for uploading files.
 * - Uses Dialog component to show/hide the upload interface.
 * - If the user is subscribed, it allows larger file uploads.
 */
const UploadButton = ({ isSubscribed }: { isSubscribed: boolean }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false); // State to manage the dialog's visibility

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(v) => {
        if (!v) {
          setIsOpen(v); // Close the dialog when needed
        }
      }}
    >
      <DialogTrigger onClick={() => setIsOpen(true)} asChild>
        <Button className="bg-blue-500 font-semibold  bg-opacity-75">
          Upload PDF
        </Button>
      </DialogTrigger>

      <DialogContent>
        <UploadDropzone isSubscribed={isSubscribed} />
      </DialogContent>
    </Dialog>
  );
};

export default UploadButton;