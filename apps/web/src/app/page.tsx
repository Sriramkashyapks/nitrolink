'use client';

import { ConnectKitButton } from 'connectkit';
import { useAccount, useEnsName, useEnsAvatar } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ZapWidget } from '@/components/zap-widget';
import { RecentTransactions } from '@/components/recent-transactions';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { LayoutDashboard, Zap, Radio } from 'lucide-react';
import { FlashStreamWidget } from '@/components/flash-stream-widget';
import { Footer } from '@/components/footer';

// Helper to force correct network names based on ID
const getNetworkName = (chain: any) => {
    const id = chain?.id;
    if (id === 11155111) return "Sepolia";          // Ethereum Sepolia
    if (id === 84532) return "Base Sepolia";        // Base Sepolia
    if (id === 421614) return "Arbitrum Sepolia";   // Arbitrum Sepolia
    if (id === 5115) return "Citrea Testnet";       // Example if used
    return chain?.name || "Unknown Network";        // Fallback
};

export default function Home() {
    const { address, isConnected, chain } = useAccount();
    const { data: ensName } = useEnsName({ address, chainId: 1 });
    const { data: ensAvatar } = useEnsAvatar({ name: ensName!, chainId: 1 });

    return (
        <div className="min-h-screen bg-zinc-950 text-white selection:bg-emerald-500/30 font-sans flex flex-col">

            {/* 1. TOP NAVIGATION BAR */}
            <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
                    {/* LEFT: Logo */}
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <Zap className="h-5 w-5 text-black fill-black" />
                        </div>
                        <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
                            NitroLink
                        </span>
                    </div>

                    {/* CENTER: Identity Hub (Only if Connected) */}
                    {isConnected && (
                        <div className="hidden md:flex items-center gap-6 bg-zinc-900/50 border border-zinc-800/50 rounded-full px-4 py-1.5 backdrop-blur-md">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Avatar className="h-8 w-8 ring-2 ring-emerald-500/20">
                                        <AvatarImage src={ensAvatar || ''} />
                                        <AvatarFallback className="bg-zinc-800 text-zinc-400 text-xs font-bold">
                                            {address?.slice(2, 4).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-emerald-500 rounded-full border-2 border-zinc-950 animate-pulse" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-white leading-none">
                                        {ensName || `${address?.slice(0, 6)}...${address?.slice(-4)}`}
                                    </span>
                                    <span className="text-[10px] text-zinc-500 font-mono">
                                        {getNetworkName(chain)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* RIGHT: Wallet Button */}
                    <div className="flex items-center gap-4">
                        <ConnectKitButton />
                    </div>
                </div>
            </header>

            {/* 2. MAIN CONTENT AREA */}
            <main className="flex-1 container mx-auto px-4 md:px-6 py-8">

                {!isConnected ? (
                    /* STATE A: NOT CONNECTED (Hero Section) */
                    <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-8 text-center animate-in fade-in zoom-in duration-500">
                        <div className="space-y-4 max-w-2xl relative">
                            <div className="inline-flex items-center rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1 text-sm text-zinc-400 backdrop-blur-sm">
                                <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                                Live on Sepolia Testnet
                            </div>

                            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-500">
                                Money moving at <br /> the speed of thought.
                            </h1>

                            <p className="text-zinc-400 text-lg md:text-xl max-w-lg mx-auto leading-relaxed">
                                Cross-chain zaps, instant streams, and global settlements.
                                <span className="text-zinc-200 block mt-2">Connect your wallet to enter the fast lane.</span>
                            </p>
                        </div>

                        <div className="scale-110 shadow-2xl shadow-emerald-500/20 rounded-xl relative">
                            <ConnectKitButton />
                        </div>

                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-emerald-500/10 blur-[100px] rounded-full -z-10 pointer-events-none" />
                    </div>
                ) : (
                    /* STATE B: CONNECTED (Dashboard) */
                    <div className="flex flex-col gap-8 animate-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">

                        {/* ROW 1: WIDGETS (Side-by-Side) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                            {/* Main Zap Widget */}
                            <div className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
                                <div className="relative">
                                    <ZapWidget />
                                </div>
                            </div>

                            {/* Flash Stream Widget */}
                            <div className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
                                <div className="relative">
                                    <FlashStreamWidget />
                                </div>
                            </div>
                        </div>

                        {/* ROW 2: RECENT ACTIVITY */}
                        <div className="border-t border-zinc-800/50 pt-8">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <LayoutDashboard className="h-5 w-5 text-zinc-500" />
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
                                    Recent Activity
                                </span>
                            </h2>
                            <RecentTransactions />
                        </div>

                    </div>
                )}
            </main>

            {/* 3. FOOTER */}
            <Footer />
        </div>
    );
}