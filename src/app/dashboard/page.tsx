import Dashboard from "@/components/Dashboard";
import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { getUserSubscriptionPlan } from "@/lib/stripe";

export default async function Page() {
  const { getUser } = getKindeServerSession();
  const user = getUser();

  // check if user is authenticated
  if (!user || !user.id) redirect("/auth-callback?origin=dashboard");

  // check for user in db
  const dbUser = await db.user.findFirst({
    where: {
      id: user.id
    }
  });

  if (!dbUser) redirect("/auth-callback?origin=dashboard");
  const subscriptionPlan = await getUserSubscriptionPlan();

  return <Dashboard />;
}
