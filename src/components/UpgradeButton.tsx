"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { trpc } from "@/app/_trpc/client";

/**
 * UpgradeButton component:
 * - Renders a button that initiates the process of upgrading the user's plan by creating a Stripe session.
 * - When clicked, it triggers a mutation that creates a Stripe checkout session.
 * - If successful, the user is redirected to the Stripe checkout URL or a fallback billing dashboard.
 */
const UpgradeButton = () => {
  /**
   * createStripeSession:
   * - This mutation triggers a request to create a Stripe session for upgrading the user's plan.
   * - On success, the user is redirected to the returned Stripe URL for the checkout process.
   * - If the URL is not available for some reason, the user is directed to the billing dashboard as a fallback.
   */
  const { mutate: createStripeSession } = trpc.createStripeSession.useMutation({
    onSuccess: ({ url }) => {
      console.log(url);
      // Redirect the user to the Stripe checkout session or billing page
      window.location.href = url ?? "/dashboard/billing";
    }
  });

  return (
    /**
     * Button component:
     * - When clicked, it calls the createStripeSession function to initiate the upgrade process.
     * - The button contains an "Upgrade now" label and an arrow icon.
     */
    <Button onClick={() => createStripeSession()} className="w-full">
      Upgrade now <ArrowRight className="h-5 w-5 ml-1.5" />{" "}
      {/* Icon displayed next to the text */}
    </Button>
  );
};

export default UpgradeButton;
