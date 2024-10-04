import { createNextRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core"; // Assuming this is your router

// Export routes for Next.js App Router
export const { GET, POST } = createNextRouteHandler({
  router: ourFileRouter // Correct spelling
});
