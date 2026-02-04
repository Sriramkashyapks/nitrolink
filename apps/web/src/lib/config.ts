import { createConfig, http, createStorage, cookieStorage } from 'wagmi';
import { mainnet, baseSepolia, sepolia, arbitrumSepolia } from 'wagmi/chains';
import { defineChain } from 'viem';
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors';

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_ID || "YOUR_PROJECT_ID_HERE";

// Arc Testnet isn't in wagmi's default chain list yet, so we need to define it ourselves
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

declare module 'wagmi' {
    interface Register {
        config: typeof config;
    }
}

const configConfig = {
    chains: [arcTestnet, mainnet, baseSepolia, sepolia, arbitrumSepolia],
    connectors: [
        injected(),
        walletConnect({ projectId: walletConnectProjectId }),
        coinbaseWallet({ appName: "NitroLink" }),
    ],
    transports: {
        [arcTestnet.id]: http(),
        [mainnet.id]: http("https://eth.llamarpc.com"),
        [baseSepolia.id]: http(),
        [sepolia.id]: http(),
        [arbitrumSepolia.id]: http(),
    },
    // Use localStorage instead of cookieStorage to prevent Turbopack HMR issues
    storage: createStorage({
        storage: typeof window !== 'undefined' ? window.localStorage : cookieStorage,
    }),
    ssr: true,
} as const;

export const config = createConfig(configConfig);

// This is a simplified singleton pattern for HMR - though Wagmi createConfig usually handles this OK, 
// explicit handling can help with the 'WalletConnect Core already initialized' error in strict mode.
// However, the cleanest way in v2 with Next.js is just to export the const.
// The error usually comes from re-importing the file.
// Let's rely on standard export but double check dependencies.