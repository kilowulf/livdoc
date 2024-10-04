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
  // Accessible without authentication. It checks if a user exists in the database,
  // and if not, creates a new user using data from the authentication session.
  authCallback: publicProcedure.query(async () => {
    const { getUser } = getKindeServerSession(); // Retrieve the user session
    const user = await getUser(); // Get the user object from the session

    if (!user.id || !user.email) throw new TRPCError({ code: "UNAUTHORIZED" }); // Throw error if the user is not authenticated

    // Check if the user already exists in the database
    const dbUser = await db.user.findFirst({
      where: {
        id: user.id
      }
    });

    // If user doesn't exist, create a new user entry in the database
    if (!dbUser) {
      await db.user.create({
        data: {
          id: user.id,
          email: user.email
        }
      });
    }

    return { success: true }; // Return success if the operation completes
  }),

  // Private procedure for fetching all files associated with the authenticated user.
  getUserFiles: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx; // Extract the userId from the context (authenticated user)

    // Retrieve all files belonging to the user
    return await db.file.findMany({
      where: {
        userId
      }
    });
  }),

  // Private procedure for deleting a file.
  // The file is identified by the id passed as input, and it ensures the file belongs to the authenticated user.
  deleteFile: privateProcedure
    .input(z.object({ id: z.string() })) // Validate the input to ensure a string ID is provided
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      // Find the file by its ID and make sure it belongs to the user
      const file = await db.file.findFirst({
        where: {
          id: input.id,
          userId
        }
      });

      if (!file) throw new TRPCError({ code: "NOT_FOUND" }); // Throw an error if the file is not found

      // Delete the file
      await db.file.delete({
        where: {
          id: input.id
        }
      });

      return file; // Return the deleted file object
    }),

  createStripeSession: privateProcedure.mutation(async ({ ctx }) => {
    const { userId } = ctx;

    const billingUrl = absoluteUrl(`/dashboard/billing`);

    if (!userId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const dbUser = await db.user.findFirst({
      where: {
        id: userId
      }
    });

    if (!dbUser) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const subscriptionPlan = await getUserSubscriptionPlan();

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
      metadata: {
        userId: userId
      }
    });
    return { url: stripeSession.url };
  }),

  // Private procedure for fetching messages associated with a file.
  // Supports pagination with a cursor and limit on the number of messages retrieved.
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
      const limit = input.limit ?? INFINITE_QUERY_LIMIT; // Default to the query limit if none is provided

      // Check if the file exists and belongs to the user
      const file = await db.file.findFirst({
        where: {
          id: fileId,
          userId
        }
      });

      if (!file) throw new TRPCError({ code: "NOT_FOUND" }); // Throw error if the file is not found

      // Retrieve the messages associated with the file, supporting pagination
      const messages = await db.message.findMany({
        take: limit + 1, // Fetch one extra message to determine if there's more data to paginate
        where: {
          fileId
        },
        orderBy: {
          createdAt: "desc" // Sort messages by creation date (most recent first)
        },
        cursor: cursor ? { id: cursor } : undefined, // Handle pagination via cursor
        select: {
          id: true,
          isUserMessage: true,
          createdAt: true,
          text: true
        }
      });

      // Determine if there is a next cursor for pagination
      let nextCursor: typeof cursor | undefined = undefined;
      if (messages.length > limit) {
        const nextItem = messages.pop(); // Remove the extra message
        nextCursor = nextItem?.id; // Set the next cursor to continue pagination
      }

      return {
        messages, // Return the retrieved messages
        nextCursor // Return the next cursor for pagination
      };
    }),

  // Private procedure for getting the upload status of a specific file.
  getFileUploadStatus: privateProcedure
    .input(z.object({ fileId: z.string() })) // Validate the fileId input
    .query(async ({ input, ctx }) => {
      // Find the file by its ID and ensure it belongs to the user
      const file = await db.file.findFirst({
        where: {
          id: input.fileId,
          userId: ctx.userId
        },
        select: {
          uploadStatus: true
        }
      });
      if (!file) return { status: "PENDING" as const }; // Return 'PENDING' if the file is not found
      return { status: file?.uploadStatus || ("PENDING" as const) }; // Return the file's upload status
    }),

  // Private procedure for retrieving a file based on its key.
  getFile: privateProcedure
    .input(z.object({ key: z.string() })) // Validate the file key input
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      // Find the file by its key and ensure it belongs to the user
      const file = await db.file.findFirst({
        where: {
          key: input.key,
          userId
        }
      });

      if (!file) throw new TRPCError({ code: "NOT_FOUND" }); // Throw an error if the file is not found

      return file; // Return the found file
    })
});

// Export the type of the appRouter for use in other parts of the app.
export type AppRouter = typeof appRouter;
