import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility function `cn` to handle combining and merging class names.
// This function accepts a variable number of class name inputs, allowing for
// dynamic or conditional class names to be passed in as an array, string, or object.

export function cn(...inputs: ClassValue[]) {
  // The function first uses `clsx` to combine and conditionally apply class names,
  // and then passes the result to `twMerge` to handle Tailwind-specific class merging.
  // `twMerge` ensures that Tailwind classes are merged correctly, especially when there are
  // conflicting classes (e.g., different `padding` or `margin` values).
  return twMerge(clsx(inputs));
}

export function absoluteUrl(path: string) {
  if (typeof window !== "undefined") return path;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}${path}`;
  return `http://localhost:${process.env.PORT ?? 3000}${path}`;
}
