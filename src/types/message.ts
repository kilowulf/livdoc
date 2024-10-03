// Import the AppRouter type from the TRPC router file and inferRouterOutputs for type inference.
import { AppRouter } from "@/trpc";
import { inferRouterOutputs } from "@trpc/server";

// This type infers the shape of the outputs returned by the TRPC router.
// It enables TypeScript to understand the structure of the API responses for strongly typed operations.
type RouterOutput = inferRouterOutputs<AppRouter>;

// Define a specific type for messages returned by the "getFileMessages" route from the TRPC router.
// This allows us to work with the structure of messages returned by this API call.
type Messages = RouterOutput["getFileMessages"]["messages"];

// Define a new type OmitText that removes the "text" field from the Messages array.
// This is useful when we want to extend or modify the "text" field separately without altering other properties.
type OmitText = Omit<Messages[number], "text">;

// Define an ExtendedText type, which reintroduces the "text" field but allows it to be either a string or JSX element.
// This enables rendering richer, dynamic content in a React component while maintaining type safety.
type ExtendedText = {
  text: string | JSX.Element; // Allows text to either be plain text or a React element for rendering.
};

// Finally, we combine the OmitText and ExtendedText types to create a new ExtendedMessage type.
// This type represents a message structure where all original fields remain intact, but the "text" field is now extended to support JSX.
export type ExtendedMessage = OmitText & ExtendedText;
