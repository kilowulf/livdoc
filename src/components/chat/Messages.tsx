import { trpc } from "@/app/_trpc/client";
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query";
import { Loader2, MessageSquare } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import Message from "./Message";
import { useContext, useEffect, useRef } from "react";
import { ChatContext } from "./ChatContext";
import { useIntersection } from "@mantine/hooks";

/**
 * `MessagesProps` defines the props required by the `Messages` component.
 * - `fileId`: A string representing the ID of the file for which messages are being fetched.
 */
interface MessagesProps {
  fileId: string;
}

/**
 * The `Messages` component fetches and renders a list of chat messages related to a specific file.
 * It implements infinite scrolling to load more messages as the user reaches the bottom of the list.
 * AI-generated messages and user messages are handled, and the component displays loading states while
 * data is being fetched or processed by the AI.
 */
const Messages = ({ fileId }: MessagesProps) => {
  // Access the context to determine if the AI is currently generating a response.
  const { isLoading: isAiThinking } = useContext(ChatContext);

  // Fetch messages using the TRPC infinite query, which retrieves paginated messages.
  // The query sends the `fileId` and a limit for how many messages to retrieve per page.
  const { data, isLoading, fetchNextPage } =
    trpc.getFileMessages.useInfiniteQuery(
      {
        fileId,
        limit: INFINITE_QUERY_LIMIT // Limit the number of messages retrieved per query
      },
      {
        getNextPageParam: (lastPage) => lastPage?.nextCursor, // Cursor-based pagination to fetch the next set of messages
        keepPreviousData: true // Maintain previous messages in the UI while fetching new ones
      }
    );

  // Flatten the paginated data into a single array of messages.
  const messages = data?.pages.flatMap((page) => page.messages);

  // Define a loading message to be displayed when the AI is generating a response.
  const loadingMessage = {
    createdAt: new Date().toISOString(), // Current timestamp
    id: "loading-message", // Special ID for the loading message
    isUserMessage: false, // AI-generated message
    text: (
      <span className="flex h-full items-center justify-center">
        <Loader2 className="h-4 w-4 animate-spin" />{" "}
        {/* Spinner icon for loading */}
      </span>
    )
  };

  // Combine the messages: prepend the loading message if AI is generating a response.
  const combinedMessages = [
    ...(isAiThinking ? [loadingMessage] : []), // Add the loading message if AI is thinking
    ...(messages ?? []) // Add the actual retrieved messages
  ];

  // Create a reference to the last message, used for infinite scrolling.
  const lastMessageRef = useRef<HTMLDivElement>(null);

  // Use the `useIntersection` hook to observe the last message and trigger loading of the next page.
  const { ref, entry } = useIntersection({
    root: lastMessageRef.current, // Observe the last message in the current list
    threshold: 1 // Trigger when the last message is fully visible
  });

  // Effect to fetch the next page of messages when the user scrolls to the bottom of the chat.
  useEffect(() => {
    if (entry?.isIntersecting) {
      fetchNextPage(); // Fetch more messages when the last message is visible
    }
  }, [entry, fetchNextPage]);

  return (
    <div className="flex max-h-[calc(100vh-3.5rem-7rem)] border-zinc-200 flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch">
      {/* Conditionally render the messages or show a loading state if data is being fetched */}
      {combinedMessages && combinedMessages.length > 0 ? (
        // Map through the combined messages and render each message component
        combinedMessages.map((message, i) => {
          // Check if the next message is from the same person (user/AI) to avoid displaying duplicate avatars.
          const isNextMessageSamePerson =
            combinedMessages[i - 1]?.isUserMessage ===
            combinedMessages[i]?.isUserMessage;

          // Attach the intersection observer ref to the last message to trigger infinite scrolling.
          if (i === combinedMessages.length - 1) {
            return (
              <Message
                ref={ref} // Attach the ref to the last message for infinite scrolling
                message={message}
                isNextMessageSamePerson={isNextMessageSamePerson}
                key={message.id}
              />
            );
          } else
            return (
              <Message
                message={message}
                isNextMessageSamePerson={isNextMessageSamePerson}
                key={message.id}
              />
            );
        })
      ) : isLoading ? (
        // Show loading skeletons if messages are still being fetched.
        <div className="w-full flex flex-col gap-2">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : (
        // Show a placeholder when there are no messages to display.
        <div className="flex-1 flex flex-col items-center justify-center gap-2">
          <MessageSquare className="h-8 w-8 text-blue-500" />{" "}
          {/* Empty chat icon */}
          <h3 className="font-semibold text-xl">You&apos;re all set!</h3>{" "}
          {/* Placeholder text */}
          <p className="text-zinc-500 text-sm">
            Ask your first question to get started.
          </p>
        </div>
      )}
    </div>
  );
};

export default Messages;
