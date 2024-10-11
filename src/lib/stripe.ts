/**
 * getUserSubscriptionPlan function:
 *
 * - Retrieves the current user's subscription plan details, including subscription status, active plan, and Stripe information.
 * - It interacts with both the Kinde authentication server and Stripe to gather necessary data.
 * - Returns details such as whether the user is subscribed, the current plan, and if the subscription is canceled.
 */

import { PLANS } from "@/config/stripe"; // Import available subscription plans
import { db } from "@/db"; // Database instance
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"; // Kinde authentication session handler
import Stripe from "stripe";

/**
 * Initializes Stripe with the secret key from the environment variable.
 * - Sets the API version and enables TypeScript support for strict type safety.
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2023-08-16",
  typescript: true
});

/**
 * Retrieves the user's subscription plan from the database and Stripe.
 *
 * - If the user is not authenticated or does not exist in the database, returns the default (free) plan.
 * - If the user is subscribed, retrieves additional Stripe information such as the subscription status and expiration.
 * - If the user is subscribed, checks if the subscription is canceled or set to cancel at the end of the period.
 *
 * @returns {object} Plan information, subscription status, and Stripe-related data (e.g., subscription ID, current period end).
 */
export async function getUserSubscriptionPlan() {
  const { getUser } = getKindeServerSession(); // Retrieves the current session user
  const user = getUser();

  // If no user ID exists, return the Free plan and indicate the user is not subscribed
  if (!user.id) {
    return {
      ...PLANS[0], // Default to the Free plan
      isSubscribed: false,
      isCanceled: false,
      stripeCurrentPeriodEnd: null
    };
  }

  // Fetch the user from the database using their ID
  const dbUser = await db.user.findFirst({
    where: {
      id: user.id
    }
  });

  // If no database record exists for the user, return the Free plan
  if (!dbUser) {
    return {
      ...PLANS[0],
      isSubscribed: false,
      isCanceled: false,
      stripeCurrentPeriodEnd: null
    };
  }

  /**
   * isSubscribed: Checks if the user has an active subscription.
   * - The subscription is considered active if there's a valid Stripe price ID and the subscription period has not ended.
   * - 86400000 milliseconds represents one day.
   */
  const isSubscribed = Boolean(
    dbUser.stripePriceId &&
      dbUser.stripeCurrentPeriodEnd &&
      dbUser.stripeCurrentPeriodEnd.getTime() + 86_400_000 > Date.now()
  );

  /**
   * Determine the current plan based on the user's Stripe price ID, or null if not subscribed.
   */
  const plan = isSubscribed
    ? PLANS.find((plan) => plan.price.priceIds.test === dbUser.stripePriceId)
    : null;

  let isCanceled = false;

  /**
   * If the user is subscribed and has a valid Stripe subscription ID, check whether the subscription is set to be canceled.
   */
  if (isSubscribed && dbUser.stripeSubscriptionId) {
    const stripePlan = await stripe.subscriptions.retrieve(
      dbUser.stripeSubscriptionId
    );
    isCanceled = stripePlan.cancel_at_period_end; // Check if the subscription is scheduled to cancel
  }

  /**
   * Return the subscription details including the plan, Stripe IDs, and subscription status.
   */

  return {
    ...plan, // The user's current plan
    stripeSubscriptionId: dbUser.stripeSubscriptionId,
    stripeCurrentPeriodEnd: dbUser.stripeCurrentPeriodEnd,
    stripeCustomerId: dbUser.stripeCustomerId,
    isSubscribed, // Boolean indicating if the user is subscribed
    isCanceled // Boolean indicating if the subscription is canceled
  };
}
