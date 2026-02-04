import { createConfig, http } from 'wagmi';
import { mainnet, baseSepolia } from 'wagmi/chains';
import { defineChain } from 'viem';
import { getDefaultConfig } from 'connectkit';

// Arc Testnet isn't in wagmi's default chain list yet, so we need to define it ourselves
// This configuration tells our app how to connect to the Arc Testnet blockchain
export const arcTestnet = defineChain({
    id: 5_042_002,
    name: 'Arc Testnet',
    network: 'arc-testnet',
    // Arc uses USDC as its native currency instead of ETH
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

// Main wagmi configuration for the entire app
// This sets up wallet connections and blockchain interactions
export const config = createConfig(
    getDefaultConfig({
        // WalletConnect project ID - get yours from cloud.walletconnect.com
        // Falls back to a placeholder if the environment variable isn't set
        walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_ID || "YOUR_PROJECT_ID_HERE",

        appName: "NitroLink",

        // We support three chains in our app:
        // - Arc Testnet: for handling payments
        // - Ethereum Mainnet: for ENS name resolution
        // - Base Sepolia: for Zaps functionality
        chains: [arcTestnet, mainnet, baseSepolia],

        // Configure how we connect to each blockchain
        transports: {
            [arcTestnet.id]: http(),
            // Using LlamaRPC for Mainnet since it's more reliable for ENS lookups
            [mainnet.id]: http("https://eth.llamarpc.com"),
            [baseSepolia.id]: http(),
        },
    })
);