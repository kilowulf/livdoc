import { clsx, type ClassValue } from "clsx";
import { Metadata } from "next";
import { twMerge } from "tailwind-merge";

/**
 * Utility function `cn` to handle combining and merging class names.
 * This function accepts a variable number of class name inputs, allowing for
 * dynamic or conditional class names to be passed in as an array, string, or object.
 */
export function cn(...inputs: ClassValue[]) {
  // Combines class names using `clsx` and merges conflicting Tailwind classes with `twMerge`.
  // Ensures correct handling of Tailwind-specific class merging (e.g., handling different padding values).
  return twMerge(clsx(inputs));
}

/**
 * Constructs an absolute URL for the provided path, adjusting for different environments.
 * - In the client-side browser environment, it simply returns the given path.
 * - In a server-side environment, it constructs a full URL based on the environment variables:
 *   - Uses `VERCEL_URL` if available (for production deployment).
 *   - Falls back to `localhost` and the specified port if running locally.
 */
export function absoluteUrl(path: string) {
  if (typeof window !== "undefined") return path; // Client-side: return the relative path
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}${path}`; // Vercel URL in production
  return `http://localhost:${process.env.PORT ?? 3000}${path}`; // Localhost URL for development
}

/**
 * Constructs metadata for the application, primarily for SEO and social media sharing.
 * - The metadata includes title, description, and images for Open Graph and Twitter cards.
 * - Supports custom icons and can specify `noIndex` to prevent search engines from indexing.
 * - Defaults are provided for `title`, `description`, `image`, and `icons`.
 */
export function constructMetadata({
  title = "LivDoc - Document Chatbot for Professionals",
  description = "LivDoc is an open-source software to make chatting to your PDF files easy.",
  image = "/assets/thumbnail.png",
  icons = "/favicon.ico",
  noIndex = false
}: {
  title?: string;
  description?: string;
  image?: string;
  icons?: string;
  noIndex?: boolean;
} = {}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: image }] // Open Graph image for link previews
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image], // Twitter-specific image
      creator: "Thumosian"
    },
    icons,
    metadataBase: new URL("https://livdoc.vercel.app"), // Base URL for metadata links
    themeColor: "#FFF", // Theme color for browser UI customization
    ...(noIndex && {
      robots: { index: false, follow: false } // Optional no-index for search engines
    })
  };
}
