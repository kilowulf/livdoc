import { cn } from "@/lib/utils";
import { ReactNode } from "react";

/**
 * MaxWidthWrapper Component:
 * This component acts as a container that restricts its maximum width to a specified breakpoint (max-w-screen-xl).
 * It ensures consistent horizontal padding and centers its content horizontally using auto margins.
 * The className prop allows for additional custom styles to be passed in, merged with default styles.
 */

const MaxWidthWrapper = ({
  children, // The child elements to be wrapped within the container
  className // Optional custom class names to extend or override the default styles
}: {
  children: ReactNode; // ReactNode type for children, allows any valid React child elements
  className?: string; // Optional string for custom class names
}) => {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-screen-xl px-2.5 md:px-20", // Default styles for max-width, padding, and centering
        className // Merge additional class names passed via props
      )}
    >
      {children} {/* Render the children elements inside the container */}
    </div>
  );
};

export default MaxWidthWrapper;