import { db } from "@/db"; // Importing the database client
import { stripe } from "@/lib/stripe"; // Importing the Stripe client for API communication
import { headers } from "next/headers"; // Used to access request headers
import type Stripe from "stripe";

/**
 * POST function to handle Stripe webhook events.
 * - This function listens for various Stripe events (such as 'checkout.session.completed' and 'invoice.payment_succeeded').
 * - It updates the database with subscription information when a successful event is received from Stripe.
 */

/**
 * Helper function to read the raw request body as a buffer.
 */
async function buffer(readable: ReadableStream<Uint8Array>) {
  const reader = readable.getReader();
  const chunks = [];
  let done, value;

  while (!done) {
    ({ done, value } = await reader.read());
    if (value) chunks.push(value);
  }

  return Buffer.concat(chunks);
}

export async function POST(request: Request) {
  // Read the request body as text
  // const body = await request.text();
  const body = await buffer(request.body as ReadableStream<Uint8Array>);

  // Retrieve the Stripe signature from headers, used for webhook verification
  const signature = headers().get("Stripe-Signature") ?? "";

  let event: Stripe.Event; // Declare the Stripe event type

  try {
    // Construct the Stripe event using the signature and secret for validation
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || "" // Secret to validate the webhook's authenticity
    );
  } catch (err) {
    console.error(`Webhook signature verification failed.`, err);
    // If the webhook signature is invalid or there is an error, respond with an error
    return new Response(
      `Webhook Error: ${err instanceof Error ? err.message : "Unknown Error"}`,
      { status: 400 } // Bad request if the signature or event construction fails
    );
  }

  // Extract the session object from the event's data payload
  const session = event.data.object as Stripe.Checkout.Session;

  // If there is no userId in the session's metadata, do not proceed with processing
  if (!session?.metadata?.userId) {
    return new Response(null, {
      status: 200 // Exit early without processing if no userId is found
    });
  }

  // Handle event when the checkout session is completed
  if (event.type === "checkout.session.completed") {
    // Retrieve subscription details from Stripe using the subscription ID
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );

    // Update the user's subscription details in the database
    await db.user.update({
      where: {
        id: session.metadata.userId // Identify the user by the userId from session metadata
      },
      data: {
        stripeSubscriptionId: subscription.id, // Store the Stripe subscription ID
        stripeCustomerId: subscription.customer as string, // Store the Stripe customer ID
        stripePriceId: subscription.items.data[0]?.price.id, // Store the price ID for the subscription
        stripeCurrentPeriodEnd: new Date(
          subscription.current_period_end * 1000 // Convert the period end timestamp to a JavaScript date object
        )
      }
    });
  }

  // Handle event when an invoice payment is successfully completed
  if (event.type === "invoice.payment_succeeded") {
    // Retrieve the subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );

    // Update the user's subscription details in the database (e.g., new period end date)
    await db.user.update({
      where: {
        stripeSubscriptionId: subscription.id // Identify the user by their subscription ID
      },
      data: {
        stripePriceId: subscription.items.data[0]?.price.id, // Store the price ID for the subscription
        stripeCurrentPeriodEnd: new Date(
          subscription.current_period_end * 1000 // Convert the period end timestamp to a JavaScript date object
        )
      }
    });
  }

  console.log(event.type);
  // Return a successful response to Stripe to acknowledge the event
  return new Response(null, { status: 200 });
}
