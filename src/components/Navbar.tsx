import Link from "next/link";
import MaxWidthWrapper from "./MaxWidthWrapper";
import Image from "next/image";
import logo from "@/assets/logo_png.png";

export default function Navbar() {
  return (
    <nav className="sticky h-14 inset-x-0 top-0 z-30 w-full border-b border-gray-400 bg-white backdrop-blur-lg transition-all">
      <MaxWidthWrapper>
        <div className="flex h-14 items-center justify-between border-b border-zinc-700">
          <Link href="/" className="flex z-40 font-semibold">
            <Image
              src={logo}
              alt="livdoc logo"
              quality={100}
              className="flex aspect-square h-[40px] w-[160px] rounded-full object-cover pl-5"
            />
          </Link>
        </div>
      </MaxWidthWrapper>
    </nav>
  );
}
