/**
 * Page component:
 *
 * - This component renders a pricing page with details about available subscription plans.
 * - It uses a combination of tooltips, buttons, and dynamically mapped pricing data to display information for each plan (Free and Pro).
 * - Features include descriptions, pricing details, and the ability to navigate or trigger actions based on the user's subscription status.
 * - The layout is responsive, and various UI elements are used for interaction (tooltips, icons, buttons).
 */

// time: 9:06:02
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
// import UpgradeButton from '@/components/UpgradeButton';
import { buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import UpgradeButton from "@/components/UpgradeButton";
import { PLANS } from "@/config/stripe";
import { cn } from "@/lib/utils";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { ArrowRight, Check, HelpCircle, Minus } from "lucide-react";
import Link from "next/link";
import React from "react";

/**
 * Page component:
 * - Fetches user session data using getKindeServerSession and displays a pricing page for the Free and Pro plans.
 */
const Page = () => {
  const { getUser } = getKindeServerSession();
  const user = getUser();

  /**
   * pricingItems: Array of objects representing the pricing plans.
   * - Contains the plan name, description, quota, and features.
   * - Dynamically maps PLANS data from config for features like pricing and quota.
   */
  const pricingItems = [
    {
      plan: "Free",
      tagline: "For small side projects.",
      quota: 10, // Number of PDFs allowed in the Free plan
      features: [
        {
          text: "5 pages per PDF",
          footnote: "The maximum amount of pages per PDF-file."
        },
        {
          text: "4MB file size limit",
          footnote: "The maximum file size of a single PDF file."
        },
        {
          text: "Mobile-friendly interface"
        },
        {
          text: "Higher-quality responses",
          footnote: "Better algorithmic responses for enhanced content quality",
          negative: true // Negative feature: not included in Free plan
        },
        {
          text: "Priority support",
          negative: true // Negative feature: not included in Free plan
        }
      ]
    },
    {
      plan: "Pro",
      tagline: "For larger projects with higher needs.",
      quota: PLANS.find((p) => p.slug === "pro")!.quota, // Quota from PLANS config
      features: [
        {
          text: "25 pages per PDF",
          footnote: "The maximum amount of pages per PDF-file."
        },
        {
          text: "16MB file size limit",
          footnote: "The maximum file size of a single PDF file."
        },
        {
          text: "Mobile-friendly interface"
        },
        {
          text: "Higher-quality responses",
          footnote: "Better algorithmic responses for enhanced content quality"
        },
        {
          text: "Priority support"
        }
      ]
    }
  ];

  return (
    <>
      {/* MaxWidthWrapper ensures content is centered and responsive */}
      <MaxWidthWrapper className="mb-8 mt-24 text-center max-w-5xl">
        {/* Page header with title and subtitle */}
        <div className="mx-auto mb-10 sm:max-w-lg">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          >
            <div
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"
              }}
              className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            />
          </div>
          <h1 className="text-6xl font-bold sm:text-7xl whitespace-nowrap">
            Get<span className="text-blue-400"> more </span> out
          </h1>
          <h2 className="text-3xl font-bold sm:text-5xl">
            of your
            <span className="text-blue-500"> documents!</span>
          </h2>
          <p className="mt-5 text-zinc-400 sm:text-lg">
            Whether you&apos;re just trying out our service for the first time
            or looking for a service to meet a professional workload, we&apos;ve
            got you covered.
          </p>
        </div>

        {/* Pricing grid for Free and Pro plans */}
        <div className="pt-12 grid grid-cols-1 gap-10 lg:grid-cols-2">
          <TooltipProvider>
            {pricingItems.map(async ({ plan, tagline, quota, features }) => {
              const price =
                PLANS.find((p) => p.slug === plan.toLowerCase())?.price
                  .amount || 0;

              return (
                <div
                  key={plan}
                  className={cn("relative rounded-2xl bg-white shadow-lg", {
                    "border-2 border-blue-600 shadow-blue-200": plan === "Pro", // Special styling for Pro plan
                    "border border-gray-200": plan !== "Pro" // Styling for non-Pro plans
                  })}
                >
                  {/* Label for Pro plan */}
                  {plan === "Pro" && (
                    <div className="absolute -top-5 left-0 right-0 mx-auto w-32 rounded-full bg-gradient-to-r from-indigo-600 to-pink-400 px-3 py-2 text-sm font-medium text-white">
                      Upgrade now
                    </div>
                  )}

                  {/* Plan information (name, price, tagline, etc.) */}
                  <div className="p-5">
                    <h3 className="my-3 text-center font-display text-4xl font-bold text-blue-500">
                      {plan}
                    </h3>
                    <p className="text-gray-500">{tagline}</p>
                    <p className="my-5 font-display text-6xl font-semibold text-blue-500">
                      ${price}
                    </p>
                    <p className="text-gray-500">per month</p>
                  </div>

                  {/* Quota information with tooltip */}
                  <div className="flex h-20 items-center justify-center border-b border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center space-x-1">
                      <p className="text-black">
                        {quota.toLocaleString()} PDFs/mo included
                      </p>
                      <Tooltip delayDuration={300}>
                        <TooltipTrigger className="cursor-default ml-1.5">
                          <HelpCircle className="h-4 w-4 text-zinc-500" />
                        </TooltipTrigger>
                        <TooltipContent className="w-80 p-2">
                          How many PDFs you can upload per month.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>

                  {/* Feature list with conditional rendering for negative features */}
                  <ul className="my-10 space-y-5 px-8">
                    {features.map(({ text, footnote, negative }) => (
                      <li key={text} className="flex space-x-5">
                        <div className="flex-shrink-0">
                          {negative ? (
                            <Minus className="h-6 w-6 text-gray-300" />
                          ) : (
                            <Check className="h-6 w-6 text-blue-500" />
                          )}
                        </div>
                        {footnote ? (
                          <div className="flex items-center space-x-1">
                            <p
                              className={cn("text-gray-600", {
                                "text-gray-400": negative
                              })}
                            >
                              {text}
                            </p>
                            <Tooltip delayDuration={300}>
                              <TooltipTrigger className="cursor-default ml-1.5">
                                <HelpCircle className="h-4 w-4 text-zinc-500" />
                              </TooltipTrigger>
                              <TooltipContent className="w-80 p-2">
                                {footnote}
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        ) : (
                          <p
                            className={cn("text-gray-600", {
                              "text-gray-400": negative
                            })}
                          >
                            {text}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>

                  {/* Call to action button */}
                  <div className="border-t border-gray-200" />
                  <div className="p-5">
                    {plan === "Free" ? (
                      <Link
                        href={user ? "/dashboard" : "/sign-in"}
                        className={buttonVariants({
                          className: "w-full",
                          variant: "secondary"
                        })}
                      >
                        {user ? "Upgrade now" : "Sign up"}
                        <ArrowRight className="h-5 w-5 ml-1.5" />
                      </Link>
                    ) : user ? (
                      <UpgradeButton />
                    ) : (
                      <Link
                        href="/sign-in"
                        className={buttonVariants({ className: "w-full" })}
                      >
                        {user ? "Upgrade now" : "Sign up"}
                        <ArrowRight className="h-5 w-5 ml-1.5" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </TooltipProvider>
        </div>
      </MaxWidthWrapper>
    </>
  );
};

export default Page;
