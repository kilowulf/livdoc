import { createRouteHandler } from "uploadthing/next"; // Correct import
import { ourFileRouter } from "./core"; // Assuming this is your router

// Export routes for Next.js App Router
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter // Correct spelling
});
