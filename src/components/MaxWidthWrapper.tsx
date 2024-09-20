import { cn } from "@/lib/util";
import { ReactNode } from "react";

const MaxWidthWrapper = ({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) => {
  return <div className={cn(className)}>{children}</div>;
};

export default MaxWidthWrapper;
