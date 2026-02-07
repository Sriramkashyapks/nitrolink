import { createConfig, http, createStorage, cookieStorage } from 'wagmi';
import { mainnet, baseSepolia, sepolia, arbitrumSepolia } from 'wagmi/chains';
import { defineChain } from 'viem';
import { getDefaultConfig } from 'connectkit';

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_ID || "";

// Arc Testnet definition
export const arcTestnet = defineChain({
    id: 5_042_002,
    name: 'Arc Testnet',
    network: 'arc-testnet',
    nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
    rpcUrls: {
        default: { http: ['https://rpc.testnet.arc.network'] },
        public: { http: ['https://rpc.testnet.arc.network'] },
    },
    blockExplorers: {
        default: { name: 'ArcScan', url: 'https://testnet.arcscan.app' },
    },
    testnet: true,
});

export const config = createConfig(
    getDefaultConfig({
        // Your chains - Sepolia is now first to match user's wallet
        chains: [sepolia, baseSepolia, arbitrumSepolia, arcTestnet, mainnet],
        transports: {
            [sepolia.id]: http(),
            [baseSepolia.id]: http(),
            [arbitrumSepolia.id]: http(),
            [arcTestnet.id]: http(),
            [mainnet.id]: http("https://eth.llamarpc.com"),
        },

        // Required API Keys
        walletConnectProjectId,

        // Required App Info
        appName: "NitroLink",

        // Optional App Info
        appDescription: "Instant crypto streaming and cross-chain settlements",
        appUrl: "http://localhost:3000", // Updated for development
        appIcon: "https://i.imgur.com/placeholder.png", // Updated to avoid conflicts
    }),
);

declare module 'wagmi' {
    interface Register {
        config: typeof config;
    }
}