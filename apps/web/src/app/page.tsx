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
        <div className="min-h-screen bg-zinc-950 text-white selection:bg-emerald-500/30 font-sans flex flex-col overflow-x-hidden max-w-full">

            {/* ================= TOP NAV ================= */}
            <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="container mx-auto px-3 sm:px-4 md:px-6 h-14 sm:h-16 flex items-center justify-between mt-3 sm:mt-6">

                    {/* Logo */}
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        <div className="h-7 w-7 sm:h-8 sm:w-8 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-black fill-black" />
                        </div>
                        <span className="text-base sm:text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
                            NitroLink
                        </span>
                    </div>

                    {/* Wallet */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        <ConnectKitButton theme="midnight" />
                    </div>
                </div>
            </header>

            {/* ================= MAIN ================= */}
            <main className="flex-1 container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">

                {!isConnected ? (
                    /* ---------- HERO ---------- */
                    <div className="flex flex-col items-center justify-center min-h-[60vh] sm:min-h-[70vh] space-y-6 sm:space-y-8 text-center animate-in fade-in zoom-in duration-500 px-2">
                        <div className="space-y-3 sm:space-y-4 max-w-2xl relative">

                            <div className="inline-flex items-center rounded-full border border-zinc-800 bg-zinc-900/50 px-2.5 sm:px-3 py-1 text-xs sm:text-sm text-zinc-400 backdrop-blur-sm">
                                <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                                Live on Sepolia Testnet
                            </div>

                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-500 px-2 py-2">
                                Money moving at <br /> the speed of thought.
                            </h1>

                            <p className="text-zinc-400 text-base sm:text-lg md:text-xl max-w-lg mx-auto leading-relaxed px-2">
                                Cross-chain zaps, instant streams, and global settlements.
                                <span className="text-zinc-200 block mt-2">
                                    Connect your wallet to enter the fast lane.
                                </span>
                            </p>
                        </div>

                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] lg:w-[800px] h-[200px] sm:h-[300px] lg:h-[400px] bg-emerald-500/10 blur-[80px] sm:blur-[120px] rounded-full -z-10 pointer-events-none" />
                    </div>
                ) : (
                    /* ---------- DASHBOARD ---------- */
                    <div className="flex flex-col gap-6 sm:gap-8 md:gap-10 animate-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">

                        {/* Widgets */}
                        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 lg:gap-0 items-start">

                            {/* Zap */}
                            <div className="h-full lg:pr-6">
                                <ZapWidget />
                            </div>

                            {/* ========= MIDDLE DIVIDER (Between Widgets) ========= */}
                            <div className="hidden lg:block w-0.5 h-full bg-zinc-700" />
                            {/* Mobile/Tablet Horizontal Divider */}
                            <div className="h-0.5 bg-zinc-700 lg:hidden" />

                            {/* Flash Stream */}
                            <div className="h-full lg:pl-6">
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
