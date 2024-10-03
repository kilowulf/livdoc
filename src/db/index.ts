import { PrismaClient } from "@prisma/client";

// Declare a global variable `cachedPrisma` to hold the Prisma client instance in non-production environments.
// This prevents the creation of multiple PrismaClient instances in development mode due to module reloading.
// The `declare global` block makes sure TypeScript recognizes `cachedPrisma` as part of the global scope.
declare global {
  // eslint-disable-next-line no-var
  var cachedPrisma: PrismaClient;
}

// Initialize a variable to hold the PrismaClient instance.
let prisma: PrismaClient;

// In production, always create a new instance of PrismaClient.
// This is necessary to ensure proper database connection handling in environments where
// the application doesn't undergo frequent reloading (such as production).
if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  // In development, check if `cachedPrisma` already exists to prevent creating multiple instances.
  // If `cachedPrisma` doesn't exist, create a new PrismaClient and assign it to the global variable.
  if (!global.cachedPrisma) {
    global.cachedPrisma = new PrismaClient();
  }
  // Assign the cached PrismaClient instance to the `prisma` variable for further use.
  prisma = global.cachedPrisma;
}

// Export the initialized PrismaClient instance as `db` for use throughout the application.
// This allows consistent database access via a single client instance.
export const db = prisma;
