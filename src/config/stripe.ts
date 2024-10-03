/**
 * PLANS configuration:
 *
 * - This constant defines an array of plan objects, each representing a different subscription plan (Free and Pro).
 * - The properties within each plan include the plan's name, slug (a URL-friendly version of the name),
 *   quota (how many resources or units the plan allows), and pagesPerPdf (maximum pages allowed per PDF).
 * - Each plan also contains a nested price object with an amount and priceIds for test and production environments.
 * - This configuration is likely used in the application to manage subscription plans and their respective limits.
 */

export const PLANS = [
  {
    name: "Free", // Plan name: Free tier
    slug: "free", // Slug for URL or plan identifier
    quota: 10, // Quota: Resource or usage limit for this plan
    pagesPerPdf: 5, // Max number of pages per PDF for Free users
    price: {
      amount: 0, // Price: Free tier, amount is 0
      priceIds: {
        test: "", // Placeholder for test environment price ID
        production: "" // Placeholder for production environment price ID (unused for Free plan)
      }
    }
  },
  {
    name: "Pro", // Plan name: Pro tier
    slug: "pro", // Slug for URL or plan identifier
    quota: 50, // Quota: Resource or usage limit for this plan
    pagesPerPdf: 25, // Max number of pages per PDF for Pro users
    price: {
      amount: 4.99, // Price: $4.99 for the Pro tier
      priceIds: {
        test: "price_1Q5h0xLixez8j6TELDSPoPcY", // Test environment price ID for the Pro plan
        production: "" // Placeholder for production environment price ID (can be set later)
      }
    }
  }
];
