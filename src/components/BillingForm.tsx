"use client";

import { getUserSubscriptionPlan } from "@/lib/stripe";
import { useToast } from "./ui/use-toast";
import { trpc } from "@/app/_trpc/client";
import MaxWidthWrapper from "./MaxWidthWrapper";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "./ui/card";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

/**
 * BillingForm component:
 * - This component allows the user to manage or upgrade their subscription plan.
 * - It fetches the user's current subscription plan and provides a form for subscription management or upgrade.
 */
interface BillingFormProps {
  /**
   * subscriptionPlan: Contains details of the user's current subscription plan.
   * - This is fetched using the `getUserSubscriptionPlan` function and passed as a prop.
   */
  subscriptionPlan: Awaited<ReturnType<typeof getUserSubscriptionPlan>>;
}

const BillingForm = ({ subscriptionPlan }: BillingFormProps) => {
  const { toast } = useToast(); // Hook for displaying toast notifications

  /**
   * trpc.createStripeSession: Mutation to create a Stripe session.
   * - On success, the user is redirected to the Stripe billing page via the returned URL.
   * - If there is an issue, a toast notification is displayed.
   */
  const { mutate: createStripeSession } = trpc.createStripeSession.useMutation({
    onSuccess: ({ url }) => {
      if (url) window.location.href = url;
      if (!url) {
        toast({
          title: "There was a problem...",
          description: "Please try again in a moment",
          variant: "destructive"
        });
      }
    }
  });

  return (
    <MaxWidthWrapper className="max-w-5xl">
      {/* Form for managing/upgrading subscription */}
      <form
        className="mt-12"
        onSubmit={(e) => {
          e.preventDefault();
          createStripeSession(); // Trigger Stripe session creation when form is submitted
        }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Subscription Plan</CardTitle>
            <CardDescription>
              You are currently on the <strong>{subscriptionPlan.name}</strong>{" "}
              plan.
            </CardDescription>
          </CardHeader>

          <CardFooter className="flex flex-col items-start space-y-2 md:flex-row md:justify-between md:space-x-0 ">
            <Button type="submit" variant="gradient">
              {/* {isLoading ? (
                <Loader2 className="mr-4 h-4 w-4 animate-spin" /> // Loading spinner when the Stripe session is being created
              ) : null}
              {subscriptionPlan.isSubscribed
                ? "Manage Subscription" // Button text for managing the existing subscription
                : "Upgrade to PRO"} */}
            </Button>

            {subscriptionPlan.isSubscribed ? (
              <p className="rounded-full text-xs font-medium ">
                {subscriptionPlan.isCanceled
                  ? "Your plan will be canceled on " // If the subscription is canceled, display the cancellation date
                  : "Your plan renews on"}
                {/* If the subscription is active, display the renewal date */}
                {format(subscriptionPlan.stripeCurrentPeriodEnd!, "dd.MM.yyyy")}
                .
              </p>
            ) : null}
          </CardFooter>
        </Card>
      </form>
    </MaxWidthWrapper>
  );
};

export default BillingForm;
