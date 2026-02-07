'use client';

import { type State, WagmiProvider } from 'wagmi';
import { ConnectKitProvider } from 'connectkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '@/lib/config';

import { Toaster } from 'sonner';

// Suppress harmless Aave/Family Accounts SDK warnings
if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = (...args) => {
    // Join all arguments to catch errors with multiple parts
    const message = args.join(' ');
    // Suppress known harmless wallet connection warnings
    if (message.includes('Aave Wallet') ||
      message.includes('Family Accounts') ||
      message.includes('FamilyAccountsSdk') ||
      message.includes('EIP1193 provider connection timeout')) {
      return; // Suppress these warnings - they're harmless
    }
    originalError.apply(console, args);
  };
}

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

export function Providers({ children, initialState }: { children: React.ReactNode, initialState?: State }) {
  const queryClient = getQueryClient();

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {/* ConnectKit gives us the pre-built "Connect Wallet" modal */}
        <ConnectKitProvider mode="dark">
          <Toaster position="bottom-right" richColors />
          {children}
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}