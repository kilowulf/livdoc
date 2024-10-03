import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { TRPCError, initTRPC } from "@trpc/server";

// Initialize TRPC instance.
// The `initTRPC.create()` method creates a TRPC instance which will be used to define routers, procedures, and middleware.
const t = initTRPC.create();

// Extract middleware function from the TRPC instance.
// Middleware in TRPC allows us to add custom logic (e.g., authentication) before a procedure is executed.
const middleware = t.middleware;

// Authentication middleware to check if the user is logged in.
// This middleware ensures that private procedures are only accessible to authenticated users.
const isAuth = middleware(async (opts) => {
  // Retrieve the current authenticated user session using Kinde authentication.
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  // If the user is not authenticated or doesn't have an ID, throw an "UNAUTHORIZED" error.
  if (!user || !user.id) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  // If the user is authenticated, allow the request to proceed by calling `opts.next()`
  // and attaching the `userId` and user object to the context (ctx) for future use.
  return opts.next({
    ctx: {
      userId: user.id,
      user
    }
  });
});

// Define the TRPC router.
// This router will be used to define various procedures and routes within the TRPC framework.
export const router = t.router;

// Define public procedures that do not require authentication.
// These procedures are accessible to anyone without checking if the user is authenticated.
export const publicProcedure = t.procedure;

// Define private procedures that use the `isAuth` middleware to ensure only authenticated users can access them.
// Any procedure created with `privateProcedure` will be protected and require the user to be authenticated.
export const privateProcedure = t.procedure.use(isAuth);
