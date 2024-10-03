// Import `generateReactHelpers` from the "@uploadthing/react" package.
// This function is used to generate React-specific helpers for handling file uploads,
// making the integration of file uploads easier in React components.
import { generateReactHelpers } from "@uploadthing/react";

// Import the type `OurFileRouter` which defines the routes for file uploads in the project.
// This type will be passed to `generateReactHelpers` to ensure that the generated helpers
// (like `useUploadThing`) are strongly typed and specific to the file upload routes defined in the app.
import type { OurFileRouter } from "@/app/api/uploadthing/core";

// Generate React-specific helpers for handling file uploads based on `OurFileRouter`.
// The `useUploadThing` hook is created to simplify file uploading in React components.
// It handles file upload logic, such as sending files to the server, monitoring upload progress, and handling results.
// The generated hook is specifically typed for the file routes defined in `OurFileRouter`, ensuring type safety.
export const { useUploadThing } = generateReactHelpers<OurFileRouter>();
