/**
 * UserAccountNav Component:
 * This component displays a user account navigation menu with options to view the dashboard,
 * manage or upgrade the subscription, and log out. The user's name, email, and profile picture
 * are shown at the top of the menu, along with icons and links for navigation.
 * It fetches the user's subscription status to display appropriate subscription actions.
 */

import { getUserSubscriptionPlan } from "@/lib/stripe"; // Function to retrieve user's subscription plan
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "./ui/dropdown-menu"; // Dropdown menu components for user navigation
import { Button } from "./ui/button"; // Button component
import { Avatar, AvatarFallback } from "./ui/avatar"; // Avatar components for profile picture display
import Image from "next/image";
import { Icons } from "./Icons";
import Link from "next/link";
import { Gem } from "lucide-react"; // Icon for subscription upgrade
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/server"; // Logout link component for authentication

interface UserAccountNavProps {
  email: string | undefined; // User's email, optional
  name: string; // User's name
  imageUrl: string; // URL to the user's profile image
}

// Asynchronous component to handle user navigation actions based on subscription status and account details.
const UserAccountNav = async ({
  email,
  imageUrl,
  name
}: UserAccountNavProps) => {
  const subscriptionPlan = await getUserSubscriptionPlan(); // Fetch user subscription status

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="overflow-visible">
        {/* Button triggers the dropdown, displaying user's avatar or fallback icon */}
        <Button className="rounded-full h-8 w-8 aspect-square bg-blue-500">
          <Avatar className="relative w-8 h-8">
            {imageUrl ? (
              // Display user's profile image if available
              <div className="relative aspect-square h-full w-full">
                <Image
                  fill
                  src={imageUrl}
                  alt="profile picture"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              // Display fallback icon if no profile image is provided
              <AvatarFallback>
                <span className="sr-only">{name}</span>
                <Icons.user className="h-4 w-4 text-zinc-900" />
              </AvatarFallback>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      {/* Dropdown menu content, aligning to the end of the button */}
      <DropdownMenuContent className="bg-white" align="end">
        <div className="flex items-center justify-start gap-2 p-2">
          {/* User information section: name and truncated email */}
          <div className="flex flex-col space-y-0.5 leading-none">
            {name && <p className="font-medium text-sm text-black">{name}</p>}
            {email && (
              <p className="w-[200px] truncate text-xs text-zinc-700">
                {email}
              </p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator /> {/* Separator line */}
        {/* Link to the user's dashboard */}
        <DropdownMenuItem asChild>
          <Link href="/dashboard">Dashboard</Link>
        </DropdownMenuItem>
        {/* Conditional link based on subscription status: 
            - 'Manage Subscription' if subscribed 
            - 'Upgrade' with icon if not subscribed */}
        <DropdownMenuItem asChild>
          {subscriptionPlan?.isSubscribed ? (
            <Link href="/dashboard/billing">Manage Subscription</Link>
          ) : (
            <Link href="/pricing">
              Upgrade <Gem className="text-purple-600 h-4 w-4 ml-1.5" />
            </Link>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator /> {/* Separator line */}
        {/* Logout link */}
        <DropdownMenuItem className="cursor-pointer">
          <LogoutLink>Log out</LogoutLink>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserAccountNav;
