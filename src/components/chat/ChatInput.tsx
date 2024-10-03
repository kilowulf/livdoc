import { Send } from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useContext, useRef } from "react";
import { ChatContext } from "./ChatContext";

/**
 * `ChatInputProps` defines the optional prop for the `ChatInput` component.
 * - `isDisabled`: A boolean flag to disable the input and send button when needed.
 */
interface ChatInputProps {
  isDisabled?: boolean;
}

/**
 * The `ChatInput` component provides the input interface for users to type and send messages in a chat.
 * It integrates with the `ChatContext` to manage message sending and updates.
 * The component allows users to send messages via the "Enter" key or by clicking the send button.
 */
const ChatInput = ({ isDisabled }: ChatInputProps) => {
  // Access the chat context to retrieve functions and state such as `addMessage`, `handleInputChange`, `isLoading`, and `message`.
  const {
    addMessage, // Function to send a new message
    handleInputChange, // Function to update the input field as the user types
    isLoading, // Boolean indicating whether the chat is in a loading state
    message // Current message text entered by the user
  } = useContext(ChatContext);

  // Create a reference to the textarea element for managing focus programmatically after sending a message.
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    // Wrapper div that places the input area at the bottom of the screen.
    <div className="absolute bottom-0 left-0 w-full">
      <div className="mx-2 flex flex-row gap-3 md:mx-4 md:last:mb-6 lg:mx-auto lg:max-w-2xl xl:max-w-3xl">
        <div className="relative flex h-full flex-1 items-stretch md:flex-col">
          <div className="relative flex flex-col w-full flex-grow p-4">
            <div className="relative">
              {/* Textarea for input where users can type their message */}
              <Textarea
                rows={1} // Initial number of visible rows
                ref={textareaRef} // Attach the ref to the textarea for focus management
                maxRows={4} // Maximum rows before scrolling is enabled
                autoFocus // Automatically focus the textarea when the component loads
                onChange={handleInputChange} // Update the message content on input change
                value={message} // Bind the current message state to the textarea
                onKeyDown={(e) => {
                  // Handle sending the message when the "Enter" key is pressed without Shift
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault(); // Prevent default behavior (new line insertion)

                    addMessage(); // Send the message

                    textareaRef.current?.focus(); // Refocus the textarea after sending the message
                  }
                }}
                placeholder="Enter your question..." // Placeholder text for the input field
                className="resize-none pr-12 text-base py-3 scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch" // Custom styling for the textarea
              />

              {/* Button for sending the message */}
              <Button
                disabled={isLoading || isDisabled} // Disable the button while loading or when disabled explicitly
                className="absolute bottom-1.5 right-[8px]" // Position the send button inside the textarea input area
                aria-label="send message" // Accessibility label for the button
                onClick={() => {
                  addMessage(); // Send the message on button click

                  textareaRef.current?.focus(); // Refocus the textarea after sending the message
                }}
              >
                {/* Send icon within the button */}
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
