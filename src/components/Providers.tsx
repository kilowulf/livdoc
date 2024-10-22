"use client";

import React, { PropsWithChildren, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc } from "@/app/_trpc/client";
import { httpBatchLink } from "@trpc/client";
import { absoluteUrl } from "@/lib/utils";

/**
 * Providers Component:
 * This component serves as a context provider for both TRPC and React Query clients.
 * It wraps the application and ensures that TRPC and React Query functionalities
 * are accessible throughout the app, enabling efficient server-side state management
 * and remote procedure calls.
 * 
 * - `trpc.Provider`: Wraps the app to provide TRPC client functionality.
 * - `QueryClientProvider`: Wraps the app to provide react-query's query client.
 * - Both TRPC and react-query enable effective data fetching and state synchronization
 *   with backend APIs, allowing for seamless server communication and state updates.
 * 
 * */

export default function Providers({ children }: PropsWithChildren) {
  // React Query client state to manage caching, fetching, and state syncing for data queries
  const [queryClient] = useState(() => new QueryClient());

  // TRPC client state, configured to send requests to the /api/trpc endpoint with batched requests for optimization
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: absoluteUrl("/api/trpc") // Generates the full URL for the TRPC endpoint
        })
      ]
    })
  );

  // Wrap the application with TRPC and React Query providers, ensuring their functionality is available globally
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children} {/* Render all nested components within the providers */}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
