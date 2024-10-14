/**
 * MobileNav Component:
 * This component renders a mobile navigation menu with conditional links based on the user's authentication status.
 * It toggles the menu visibility on click, and automatically closes the menu when navigating to a different path.
 * The component uses icons for menu actions and supports conditional rendering for authenticated vs. unauthenticated users.
 */

"use client";

import { ArrowRight, Menu } from "lucide-react"; // Icons for navigation
import Link from "next/link";
import { usePathname } from "next/navigation"; // Hook to access the current route path
import { useEffect, useState } from "react";

const MobileNav = ({ isAuth }: { isAuth: boolean }) => {
  const [isOpen, setOpen] = useState<boolean>(false); // State to manage menu visibility

  // Toggle the menu open/closed
  const toggleOpen = () => setOpen((prev) => !prev);

  const pathname = usePathname(); // Get the current route path

  // Close the menu automatically when the path changes
  useEffect(() => {
    if (isOpen) toggleOpen();
  }, [pathname]);

  // Close the menu when navigating to the current route
  const closeOnCurrent = (href: string) => {
    if (pathname === href) {
      toggleOpen();
    }
  };

  return (
    <div className="sm:hidden">
      {/* Menu icon to toggle visibility */}
      <Menu
        onClick={toggleOpen}
        className="relative z-50 h-5 w-5 text-zinc-700"
      />

      {/* Render navigation menu when open */}
      {isOpen ? (
        <div className="fixed animate-in slide-in-from-top-5 fade-in-20 inset-0 z-0 w-full">
          <ul className="absolute bg-white border-b border-zinc-200 shadow-xl grid w-full gap-3 px-10 pt-20 pb-8">
            {/* Conditional rendering based on authentication status */}
            {!isAuth ? (
              <>
                <li>
                  {/*account image if loggged */}
                  <Link
                    onClick={() => closeOnCurrent("/sign-up")}
                    className="flex items-center w-full font-semibold text-blue-600 hover:text-white hover:bg-blue-400 px-4 py-2 rounded"
                    href="/sign-up"
                  >
                    Sign Up
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </li>
                {/* Divider */}
                <li className="my-3 h-px w-full bg-gray-400" />
                <li>
                  <Link
                    onClick={() => closeOnCurrent("/sign-in")}
                    className="flex items-center w-full font-semibold text-black hover:text-white hover:bg-blue-400 px-4 py-2 rounded"
                    href="/sign-in"
                  >
                    Sign in
                  </Link>
                </li>
                <li className="my-3 h-px w-full bg-gray-400" />
                <li>
                  <Link
                    onClick={() => closeOnCurrent("/pricing")}
                    className="flex items-center w-full font-semibold text-black hover:text-white hover:bg-blue-400 px-4 py-2 rounded"
                    href="/pricing"
                  >
                    Pricing
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    onClick={() => closeOnCurrent("/dashboard")}
                    className="flex items-center w-full font-semibold text-black hover:text-white hover:bg-blue-400 px-4 py-2 rounded"
                    href="/dashboard"
                  >
                    Dashboard
                  </Link>
                </li>
                <li className="my-3 h-px w-full bg-gray-400" />
                <li>
                  <Link
                    className="flex items-center w-full font-semibold text-black hover:text-white hover:bg-blue-400 px-4 py-2 rounded"
                    href="/sign-out"
                  >
                    Sign out
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
};

export default MobileNav;
