import { ReactNode, createContext, useRef, useState } from "react";
import { useToast } from "../ui/use-toast";
import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/app/_trpc/client";
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query";

/**
 * `StreamResponse` defines the structure of the context that will be provided to child components.
 * It includes methods for sending messages, handling input changes, and managing loading state.
 */
type StreamResponse = {
  addMessage: () => void;
  message: string;
  handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isLoading: boolean;
};

// Create the `ChatContext` with default values.
export const ChatContext = createContext<StreamResponse>({
  addMessage: () => {},
  message: "",
  handleInputChange: () => {},
  isLoading: false
});

/**
 * `Props` interface defines the expected props for the `ChatContextProvider`.
 * - `fileId`: The ID of the file being interacted with in the chat.
 * - `children`: The child components that will consume the context.
 */
interface Props {
  fileId: string;
  children: ReactNode;
}

/**
 * `ChatContextProvider` manages the chat system's state and provides context to its children.
 * It handles message sending, input changes, and real-time response streaming.
 */
export const ChatContextProvider = ({ fileId, children }: Props) => {
  // State for managing the message text and loading state.
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // TRPC utility for caching and fetching server data.
  const utils = trpc.useContext();

  // Toast hook for displaying notifications to the user.
  const { toast } = useToast();

  // Ref for holding the backup message in case of an error.
  const backupMessage = useRef("");

  // `useMutation` hook for sending messages to the server with optimistic updates.
  const { mutate: sendMessage } = useMutation({
    // Function to send the message to the server.
    mutationFn: async ({ message }: { message: string }) => {
      const response = await fetch("/api/message", {
        method: "POST",
        body: JSON.stringify({
          fileId,
          message
        })
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      return response.body;
    },
    // Optimistically update the UI before the message is sent.
    onMutate: async ({ message }) => {
      backupMessage.current = message; // Backup the current message in case of error.
      setMessage("");

      // Step 1: Cancel any ongoing fetching of messages.
      await utils.getFileMessages.cancel();

      // Step 2: Store the previous messages.
      const previousMessages = utils.getFileMessages.getInfiniteData();

      // Step 3: Optimistically update the message list with the new user message.
      utils.getFileMessages.setInfiniteData(
        { fileId, limit: INFINITE_QUERY_LIMIT },
        (old) => {
          if (!old) {
            return {
              pages: [],
              pageParams: []
            };
          }

          const newPages = [...old.pages];

          const latestPage = newPages[0]!;

          latestPage.messages = [
            {
              createdAt: new Date().toISOString(),
              id: crypto.randomUUID(),
              text: message,
              isUserMessage: true
            },
            ...latestPage.messages
          ];

          newPages[0] = latestPage;

          return {
            ...old,
            pages: newPages
          };
        }
      );

      // Indicate that the message is being sent.
      setIsLoading(true);

      return {
        previousMessages:
          previousMessages?.pages.flatMap((page) => page.messages) ?? []
      };
    },
    // Handle success: process streamed server response.
    onSuccess: async (stream) => {
      setIsLoading(false);

      if (!stream) {
        return toast({
          title: "There was a problem sending this message",
          description: "Please refresh this page and try again",
          variant: "destructive"
        });
      }

      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let done = false;

      // Accumulate the response as it streams in.
      let accResponse = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);

        accResponse += chunkValue;

        // Append the received message chunks to the message list.
        utils.getFileMessages.setInfiniteData(
          { fileId, limit: INFINITE_QUERY_LIMIT },
          (old) => {
            if (!old) return { pages: [], pageParams: [] };

            const isAiResponseCreated = old.pages.some((page) =>
              page.messages.some((message) => message.id === "ai-response")
            );

            const updatedPages = old.pages.map((page) => {
              if (page === old.pages[0]) {
                let updatedMessages;

                if (!isAiResponseCreated) {
                  updatedMessages = [
                    {
                      createdAt: new Date().toISOString(),
                      id: "ai-response",
                      text: accResponse,
                      isUserMessage: false
                    },
                    ...page.messages
                  ];
                } else {
                  updatedMessages = page.messages.map((message) => {
                    if (message.id === "ai-response") {
                      return {
                        ...message,
                        text: accResponse
                      };
                    }
                    return message;
                  });
                }

                return {
                  ...page,
                  messages: updatedMessages
                };
              }

              return page;
            });

            return { ...old, pages: updatedPages };
          }
        );
      }
    },

    // Handle errors: revert optimistic updates if the message fails to send.
    onError: (_, __, context) => {
      setMessage(backupMessage.current); // Restore the original message in case of an error.
      utils.getFileMessages.setData(
        { fileId },
        { messages: context?.previousMessages ?? [] }
      );
    },
    // Invalidate and refetch messages when the mutation is settled.
    onSettled: async () => {
      setIsLoading(false);

      await utils.getFileMessages.invalidate({ fileId });
    }
  });

  // Handle the change in the input field (update the message state).
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  // Trigger message sending when the user submits.
  const addMessage = () => sendMessage({ message });

  return (
    // Provide the context to children components.
    <ChatContext.Provider
      value={{
        addMessage,
        message,
        handleInputChange,
        isLoading
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
