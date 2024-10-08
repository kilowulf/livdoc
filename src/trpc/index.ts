/**
 * App Router Component:
 * This component defines a TRPC router with various procedures for handling user authentication, file management,
 * and subscription-related actions. It manages both public and private procedures, ensuring access control and
 * input validation. Private procedures require user authentication, while the public procedure is accessible
 * without it. The component uses TRPC for routing and handles database operations with Prisma via the 'db' instance.
 */

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"; // Authentication session handler
import { privateProcedure, publicProcedure, router } from "./trpc"; // TRPC-related imports for routing and procedure handling
import { TRPCError } from "@trpc/server"; // Error handling mechanism for TRPC
import { db } from "@/db"; // Database instance
import { z } from "zod"; // Schema validation library for input data
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query"; // Configuration value for default query limit
import { absoluteUrl } from "@/lib/utils";
import { getUserSubscriptionPlan, stripe } from "@/lib/stripe";
import { PLANS } from "@/config/stripe";

// Define the TRPC app router that handles different procedures related to authentication, file management, and messages.
export const appRouter = router({
  // Public procedure for handling authentication callback.
  // Checks if a user exists in the database; if not, creates a new user entry.
  authCallback: publicProcedure.query(async () => {
    const { getUser } = getKindeServerSession(); // Retrieve the user session
    const user = await getUser(); // Get the user object from the session

    if (!user.id || !user.email) throw new TRPCError({ code: "UNAUTHORIZED" }); // Throw error if the user is not authenticated

    // Check if the user already exists in the database
    const dbUser = await db.user.findFirst({
      where: { id: user.id }
    });

    // If user doesn't exist, create a new user entry in the database
    if (!dbUser) {
      await db.user.create({
        data: { id: user.id, email: user.email }
      });
    }

    return { success: true }; // Return success if the operation completes
  }),

  // Private procedure for fetching all files associated with the authenticated user.
  getUserFiles: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx; // Extract the userId from the context (authenticated user)

    // Retrieve all files belonging to the user
    return await db.file.findMany({
      where: { userId }
    });
  }),

  // Private procedure for deleting a file identified by its ID.
  deleteFile: privateProcedure
    .input(z.object({ id: z.string() })) // Validate the input to ensure a string ID is provided
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      // Find the file by its ID and make sure it belongs to the user
      const file = await db.file.findFirst({
        where: { id: input.id, userId }
      });

      if (!file) throw new TRPCError({ code: "NOT_FOUND" }); // Throw an error if the file is not found

      // Delete the file and return the deleted file object
      await db.file.delete({ where: { id: input.id } });
      return file;
    }),

  // Private procedure for creating a Stripe checkout or billing session based on user subscription status.
  createStripeSession: privateProcedure.mutation(async ({ ctx }) => {
    const { userId } = ctx;

    if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

    const dbUser = await db.user.findFirst({ where: { id: userId } });
    if (!dbUser) throw new TRPCError({ code: "UNAUTHORIZED" });

    const subscriptionPlan = await getUserSubscriptionPlan();
    const billingUrl = absoluteUrl(`/dashboard/billing`);

    // If user is subscribed, redirect to the billing portal, else create a new checkout session.
    if (subscriptionPlan.isSubscribed && dbUser.stripeCustomerId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: dbUser.stripeCustomerId,
        return_url: billingUrl
      });
      return { url: stripeSession.url };
    }
    const stripeSession = await stripe.checkout.sessions.create({
      success_url: billingUrl,
      cancel_url: billingUrl,
      payment_method_types: ["card", "paypal"],
      mode: "subscription",
      billing_address_collection: "auto",
      line_items: [
        {
          price: PLANS.find((plan) => plan.name === "Pro")?.price.priceIds.test,
          quantity: 1
        }
      ],
      metadata: { userId: userId }
    });
    return { url: stripeSession.url };
  }),

  // Private procedure for fetching paginated messages related to a file.
  getFileMessages: privateProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(), // Validate the limit input (optional)
        cursor: z.string().nullish(), // Validate the cursor for pagination (optional)
        fileId: z.string() // Validate the file ID
      })
    )
    .query(async ({ ctx, input }) => {
      const { userId } = ctx;
      const { fileId, cursor } = input;
      const limit = input.limit ?? INFINITE_QUERY_LIMIT; // Use default query limit if none is provided

      // Check if the file exists and belongs to the user
      const file = await db.file.findFirst({ where: { id: fileId, userId } });
      if (!file) throw new TRPCError({ code: "NOT_FOUND" });

      // Retrieve the messages associated with the file, supporting pagination
      const messages = await db.message.findMany({
        take: limit + 1, // Fetch one extra message for pagination check
        where: { fileId },
        orderBy: { createdAt: "desc" },
        cursor: cursor ? { id: cursor } : undefined,
        select: { id: true, isUserMessage: true, createdAt: true, text: true }
      });

      // Determine if there is a next cursor for pagination
      let nextCursor: typeof cursor | undefined = undefined;
      if (messages.length > limit) {
        const nextItem = messages.pop();
        nextCursor = nextItem?.id;
      }

      return { messages, nextCursor }; // Return messages and the next cursor
    }),

  // Private procedure for getting the upload status of a file.
  getFileUploadStatus: privateProcedure
    .input(z.object({ fileId: z.string() })) // Validate the fileId input
    .query(async ({ input, ctx }) => {
      const file = await db.file.findFirst({
        where: { id: input.fileId, userId: ctx.userId }
      });
      if (!file) return { status: "PENDING" as const }; // Return 'PENDING' if the file is not found
      return { status: file.uploadStatus }; // Return the file's upload status
    }),

  // Private procedure for retrieving a file using its key identifier.
  getFile: privateProcedure
    .input(z.object({ key: z.string() })) // Validate the file key input
    .mutation(async ({ ctx, input }) => {
      const file = await db.file.findFirst({
        where: { key: input.key, userId: ctx.userId }
      });
      if (!file) throw new TRPCError({ code: "NOT_FOUND" });
      return file; // Return the found file
    })
});

// Export the type of the appRouter for use in other parts of the app.
export type AppRouter = typeof appRouter;
