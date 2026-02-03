import { createConfig, http } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { defineChain } from 'viem';
import { getDefaultConfig } from 'connectkit';

// We define Arc Testnet manually
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

// We create the configuration and EXPORT it so providers.tsx can find it
export const config = createConfig(
    getDefaultConfig({
        // You can replace this string with your Project ID later
        walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_ID || "YOUR_PROJECT_ID_HERE",

        appName: "NitroLink",

        // We include Mainnet for ENS, Arc for payments
        chains: [arcTestnet, mainnet],

        transports: {
            [arcTestnet.id]: http(),
            [mainnet.id]: http("https://eth.llamarpc.com"),
        },
    })
);