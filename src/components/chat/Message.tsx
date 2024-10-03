import { cn } from "@/lib/utils";
import { ExtendedMessage } from "@/types/message";
import { Icons } from "../Icons";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";
import { forwardRef } from "react";

/**
 * MessageProps defines the properties expected by the `Message` component.
 * - `message`: Represents an individual chat message, which includes information like text content, timestamps, and user info.
 * - `isNextMessageSamePerson`: A flag indicating whether the next message in the chat comes from the same user, which affects how the avatar is displayed.
 */
interface MessageProps {
  message: ExtendedMessage;
  isNextMessageSamePerson: boolean;
}

/**
 * The `Message` component is a chat message bubble that dynamically adjusts based on who sent the message.
 * - If the message is from the user, it's aligned to the right, with a different style.
 * - If the message is from someone else, it's aligned to the left.
 * - Markdown is used to format the text, and timestamps are displayed.
 * - The `forwardRef` is used to handle DOM refs for this message block, improving accessibility and enabling interactions.
 */
const Message = forwardRef<HTMLDivElement, MessageProps>(
  ({ message, isNextMessageSamePerson }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-end", {
          "justify-end": message.isUserMessage // Aligns user messages to the right
        })}
      >
        {/* Message Avatar */}
        <div
          className={cn(
            "relative flex h-6 w-6 aspect-square items-center justify-center",
            {
              "order-2 bg-blue-600 rounded-sm": message.isUserMessage, // User avatar with blue background
              "order-1 bg-zinc-800 rounded-sm": !message.isUserMessage, // Other person's avatar with gray background
              invisible: isNextMessageSamePerson // Hide avatar if the next message is from the same person
            }
          )}
        >
          {/* Conditionally render the user's icon or the application's logo based on the sender */}
          {message.isUserMessage ? (
            <Icons.user className="fill-zinc-200 text-zinc-200 h-3/4 w-3/4" />
          ) : (
            <Icons.logo className="fill-zinc-300 h-3/4 w-3/4" />
          )}
        </div>

        {/* Message Bubble */}
        <div
          className={cn("flex flex-col space-y-2 text-base max-w-md mx-1", {
            "order-1 items-end": message.isUserMessage, // Align user message bubble to the right
            "order-2 items-start": !message.isUserMessage // Align other person's message bubble to the left
          })}
        >
          {/* Actual message content with conditional styling */}
          <div
            className={cn("px-4 py-2 rounded-lg inline-block", {
              "bg-blue-600 text-white": message.isUserMessage, // User's message has blue background and white text
              "bg-gray-200 text-gray-900": !message.isUserMessage, // Other person's message has gray background and dark text
              "rounded-br-none":
                !isNextMessageSamePerson && message.isUserMessage, // Remove bottom-right corner if it's the last message from the user
              "rounded-bl-none":
                !isNextMessageSamePerson && !message.isUserMessage // Remove bottom-left corner if it's the last message from the other person
            })}
          >
            {/* Render message text as Markdown if it's a string; otherwise, render it as JSX */}
            {typeof message.text === "string" ? (
              <ReactMarkdown
                className={cn("prose", {
                  "text-zinc-50": message.isUserMessage // User's markdown content gets lighter text color
                })}
              >
                {message.text}
              </ReactMarkdown>
            ) : (
              message.text
            )}

            {/* Display the timestamp if the message isn't a "loading" message */}
            {message.id !== "loading-message" ? (
              <div
                className={cn("text-xs select-none mt-2 w-full text-right", {
                  "text-zinc-500": !message.isUserMessage, // Other person's timestamp in gray
                  "text-blue-300": message.isUserMessage // User's timestamp in light blue
                })}
              >
                {/* Format and display the message timestamp in HH:mm format */}
                {format(new Date(message.createdAt), "HH:mm")}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
);

/**
 * The `displayName` is set to "Message" to ensure the component name is retained during debugging.
 * `forwardRef` wraps the component to allow for refs to be passed down for DOM manipulation or accessibility.
 */
Message.displayName = "Message";

export default Message;
