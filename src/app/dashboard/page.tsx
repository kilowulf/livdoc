import Dashboard from "@/components/Dashboard";
import { db } from "@/db";
import { getUserSubscriptionPlan } from "@/lib/stripe";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { getUser } = getKindeServerSession();

  // Await the user info if `getUser` is asynchronous
  const user = await getUser();

  // Check if user is authenticated
  if (!user || !user.id) {
    redirect("/auth-callback?origin=dashboard");
  }

  try {
    // Check for user in the database
    const dbUser = await db.user.findFirst({
      where: {
        id: user.id
      }
    });

    if (!dbUser) {
      redirect("/auth-callback?origin=dashboard");
    }

    // get subscription state of user
    const subscriptionPlan = await getUserSubscriptionPlan();
    console.log(subscriptionPlan);

    return <Dashboard subscriptionPlan={subscriptionPlan} />;
  } catch (error) {
    console.error("Database error:", error);
    redirect("/auth-callback?origin=dashboard");
  }
}
