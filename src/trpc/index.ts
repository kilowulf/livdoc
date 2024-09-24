import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { privateProcedure, publicProcedure, router } from "./trpc";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";

export const appRouter = router({
  /* publicProcedure:
   *  - defines a public procedure
   *  - queries are accessible to all clients (Get, read requests)
   *  - mutations are accessible to authenticated clients (POST, PATCH, PUT, DELETE requests)   *
   *
   */
  authCallback: publicProcedure.query(async () => {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user.id || !user.email) throw new TRPCError({ code: "UNAUTHORIZED" });

    // check if user in db
    const dbUser = await db.user.findFirst({
      where: {
        id: user.id
      }
    });

    // if not, create user
    if (!dbUser) {
      await db.user.create({
        data: {
          id: user.id,
          email: user.email
        }
      });
    }

    return { success: true };
  }),
  getUserFiles: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx;

    return await db.file.findMany({
      where: {
        userId
      }
    });
  })
});

export type AppRouter = typeof appRouter;
