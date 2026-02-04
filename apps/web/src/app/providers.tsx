'use client';

import { type State, WagmiProvider } from 'wagmi';
import { ConnectKitProvider } from 'connectkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '@/lib/config';
import { useEffect } from 'react';
import { useAccount } from 'wagmi';

// Create a new client for React Query. This handles caching and updating data.
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 60 * 1000,
        // Prevent refetching on window focus to avoid connection issues
        refetchOnWindowFocus: false,
        // Retry failed requests only once
        retry: 1,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important, so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

// Inner component to handle disconnect cleanup
function DisconnectHandler({ queryClient }: { queryClient: QueryClient }) {
  const { isConnected, isDisconnected } = useAccount();

  useEffect(() => {
    if (isDisconnected) {
      // Clear all queries when wallet disconnects
      queryClient.clear();

      // Clear any stored wallet state
      if (typeof window !== 'undefined') {
        // Clear localStorage items related to wallet connections
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.includes('wagmi') || key.includes('walletconnect') || key.includes('connectkit'))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
      }
    }
  }, [isDisconnected, queryClient]);

  return null;
}

export function Providers({ children, initialState }: { children: React.ReactNode, initialState?: State }) {
  const queryClient = getQueryClient();

  return (
    <WagmiProvider config={config} reconnectOnMount={false}>
      <QueryClientProvider client={queryClient}>
        {/* ConnectKit gives us the pre-built "Connect Wallet" modal */}
        <ConnectKitProvider mode="dark">
          <DisconnectHandler queryClient={queryClient} />
          {children}
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}