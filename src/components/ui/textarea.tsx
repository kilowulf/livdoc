import * as React from "react";
import TextareaAutosize, {
  TextareaAutosizeProps
} from "react-textarea-autosize";

import { cn } from "@/lib/utils";

/**
 * TextareaProps:
 * - This interface extends the default `React.TextareaHTMLAttributes`.
 * - It allows the `Textarea` component to receive all standard textarea attributes.
 */
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

/**
 * Textarea component:
 * - This component is built on top of the `TextareaAutosize` from `react-textarea-autosize`.
 * - It automatically adjusts its height based on the input content, improving user experience for text input fields.
 * - The component is forward-ref compatible, allowing external components to control the textarea via a `ref`.
 * - Tailwind CSS classes are used for styling the textarea, and additional classes can be passed via the `className` prop.
 */
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaAutosizeProps>(
  ({ className, ...props }, ref) => {
    return (
      <TextareaAutosize
        /**
         * Conditional class name merging:
         * - The `cn` utility is used to merge the default Tailwind CSS classes with any classes provided through the `className` prop.
         * - The textarea includes styling for borders, background, text size, focus state, and disabled state.
         */
        className={cn(
          "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-black ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref} // Forwarding the ref for external control
        {...props} // Spreading additional props to allow for full customization of the textarea
      />
    );
  }
);
Textarea.displayName = "Textarea";

// Exporting the `Textarea` component for use throughout the application.
export { Textarea };
