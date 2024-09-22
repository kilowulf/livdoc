import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

export default function Page() {
  const { getUser } = getKindeServerSession();
  const user = getUser();

  // check if user is authenticated
  if (!user || !user.id) redirect("/auth-callback?origin=dashboard");

  return <div>{user.email}</div>;
}
