import Link from "next/link";
import MaxWidthWrapper from "./MaxWidthWrapper";
import Image from "next/image";
import logo from "@/assets/logo_png.png";
import { buttonVariants } from "./ui/button";
import { LoginLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs/server";
import { ArrowRight } from "lucide-react";
import React from "react";

export default function Navbar() {
  return (
    <nav className="sticky h-14 inset-x-0 top-0 z-30 w-full border-b border-gray-400 bg-white backdrop-blur-lg transition-all">
      <MaxWidthWrapper>
        <div className="flex h-14 items-center justify-between border-b">
          <Link href="/" className="flex z-40 font-semibold">
            <Image
              src={logo}
              alt="livdoc logo"
              quality={100}
              className="flex aspect-square h-[40px] w-[160px] rounded-full object-cover pl-5"
            />
          </Link>
          {/*todo: add mobile navbar */}
          <div className="hidden items-center space-x-4 pr-3 sm:flex">
            <>
              <Link
                href={"/pricing"}
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Pricing
              </Link>
              <LoginLink
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Sign In
              </LoginLink>
              <RegisterLink
                className={buttonVariants({ variant: "default", size: "sm" })}
              >
                Sign Up Now
                <ArrowRight className="ml-1.5 h-5" />
              </RegisterLink>
            </>
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  );
}
