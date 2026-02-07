'use client';

import { ConnectKitButton } from 'connectkit';
import { useAccount, useEnsName, useEnsAvatar } from 'wagmi';
import { ZapWidget } from '@/components/zap-widget';
import { RecentTransactions } from '@/components/recent-transactions';
import { Zap } from 'lucide-react';
import { FlashStreamWidget } from '@/components/flash-stream-widget';
import { Footer } from '@/components/footer';

// Helper to force correct network names based on ID
const getNetworkName = (chain: any) => {
    const id = chain?.id;
    if (id === 11155111) return 'Sepolia';
    if (id === 84532) return 'Base Sepolia';
    if (id === 421614) return 'Arbitrum Sepolia';
    if (id === 5115) return 'Citrea Testnet';
    return chain?.name || 'Unknown Network';
};

export default function Home() {
    const { address, isConnected, chain } = useAccount();
    const { data: ensName } = useEnsName({ address, chainId: 1 });
    const { data: ensAvatar } = useEnsAvatar({ name: ensName!, chainId: 1 });

    return (
        <div className="min-h-screen bg-zinc-950 text-white selection:bg-emerald-500/30 font-sans flex flex-col">

            {/* ================= TOP NAV ================= */}
            <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between mt-6">

                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <Zap className="h-5 w-5 text-black fill-black" />
                        </div>
                        <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
                            NitroLink
                        </span>
                    </div>

                    {/* Wallet */}
                    <div className="flex items-center gap-4">
                        <ConnectKitButton theme="midnight" />
                    </div>
                </div>
            </header>

            {/* ================= MAIN ================= */}
            <main className="flex-1 container mx-auto px-4 py-6">

                {!isConnected ? (
                    /* ---------- HERO ---------- */
                    <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-8 text-center animate-in fade-in zoom-in duration-500">
                        <div className="space-y-4 max-w-2xl relative">

                            <div className="inline-flex items-center rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1 text-sm text-zinc-400 backdrop-blur-sm">
                                <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                                Live on Sepolia Testnet
                            </div>

                            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-500">
                                Money moving at <br /> the speed of thought.
                            </h1>

                            <p className="text-zinc-400 text-lg md:text-xl max-w-lg mx-auto leading-relaxed">
                                Cross-chain zaps, instant streams, and global settlements.
                                <span className="text-zinc-200 block mt-2">
                                    Connect your wallet to enter the fast lane.
                                </span>
                            </p>
                        </div>

                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-emerald-500/10 blur-[120px] rounded-full -z-10 pointer-events-none" />
                    </div>
                ) : (
                    /* ---------- DASHBOARD ---------- */
                    <div className="flex flex-col gap-10 animate-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">

                        {/* Widgets */}
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-0 items-start">

                            {/* Zap */}
                            <div className="h-full md:pr-6">
                                <ZapWidget />
                            </div>

                            {/* ========= MIDDLE DIVIDER (Between Widgets) ========= */}
                            <div className="hidden md:block w-0.5 h-full bg-zinc-700" />

                            {/* Flash Stream */}
                            <div className="h-full md:pl-6">
                                <FlashStreamWidget />
                            </div>
                        </div>

                        {/* ========= BOTTOM DIVIDER (Before Recent Activity) ========= */}
                        <div className="h-0.5 bg-zinc-700" />

                        {/* Recent Activity */}
                        <RecentTransactions />

                    </div>
                )}
            </main>

            {/* ================= FOOTER ================= */}
            <Footer />
        </div>
    );
}
