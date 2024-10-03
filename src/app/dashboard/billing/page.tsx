import BillingForm from "@/components/BillingForm";
import { getUserSubscriptionPlan } from "@/lib/stripe";

/**
 * Page component:
 * - This is a server-side component that retrieves the user's current subscription plan.
 * - It then renders the `BillingForm` component, passing the retrieved subscription plan as a prop.
 * - The purpose is to display the billing form with the correct subscription details.
 */
const Page = async () => {
  /**
   * subscriptionPlan:
   * - Calls the `getUserSubscriptionPlan` function to retrieve the user's current subscription plan.
   * - This function checks the user's subscription status and plan details (e.g., free or pro).
   */
  const subscriptionPlan = await getUserSubscriptionPlan();

  /**
   * BillingForm component:
   * - Renders the form that handles subscription management and billing information.
   * - The form is provided with the `subscriptionPlan` to ensure it reflects the user's current plan.
   */
  return <BillingForm subscriptionPlan={subscriptionPlan} />;
};

export default Page;
