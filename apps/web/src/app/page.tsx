'use client';

import { ConnectKitButton } from 'connectkit';
import { useAccount, useEnsName, useEnsAvatar } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ZapWidget } from '@/components/zap-widget';
import { RecentTransactions } from '@/components/recent-transactions';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { LayoutDashboard, Zap, Radio } from 'lucide-react';

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
        <div className="min-h-screen bg-zinc-950 text-white selection:bg-emerald-500/30 font-sans">

            {/* 1. TOP NAVIGATION BAR (Always Visible) */}
            <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
                    {/* Logo Area */}
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <Zap className="h-5 w-5 text-black fill-black" />
                        </div>
                        <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
                            NitroLink
                        </span>
                    </div>

                    {/* Wallet Button */}
                    {isConnected && (
                        <div className="flex items-center gap-4">
                            <ConnectKitButton />
                        </div>
                    )}
                </div>
            </header>

            {/* 2. MAIN CONTENT AREA */}
            <main className="container mx-auto px-4 md:px-6 py-8">

                {/* STATE A: NOT CONNECTED (Hero Section) */}
                {!isConnected ? (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 text-center animate-in fade-in zoom-in duration-500">

                        <div className="space-y-4 max-w-2xl">
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

                        <div className="scale-110 shadow-2xl shadow-emerald-500/20 rounded-xl">
                            <ConnectKitButton />
                        </div>

                        {/* Background Decorations */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-emerald-500/10 blur-[100px] rounded-full -z-10 pointer-events-none" />
                    </div>
                ) : (

                    /* STATE B: CONNECTED (Command Center Dashboard) */
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-bottom-4 duration-500">

                        {/* LEFT COLUMN - ACTION CENTER (8 Cols) */}
                        <div className="lg:col-span-8 space-y-6">

                            {/* Main Zap Widget */}
                            <div className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
                                <div className="relative">
                                    <ZapWidget />
                                </div>
                            </div>

                            {/* Future Feature Placeholder */}
                            <div className="h-32 border border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center text-zinc-600 bg-zinc-900/20 hover:bg-zinc-900/40 transition-colors cursor-wait">
                                <Radio className="h-6 w-6 mb-2 opacity-50" />
                                <p className="text-sm font-medium">Streaming Dashboard</p>
                                <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 mt-2">Unlocks Day 3</span>
                            </div>
                        </div>

                        {/* RIGHT COLUMN - DATA CENTER (4 Cols) */}
                        <div className="lg:col-span-4 space-y-6">

                            {/* Identity Card */}
                            <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-xs font-medium text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                                        <LayoutDashboard className="h-3 w-3" /> Identity
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-4 mb-6">
                                        <Avatar className="h-14 w-14 ring-2 ring-emerald-500/20 shadow-lg">
                                            <AvatarImage src={ensAvatar || ''} />
                                            <AvatarFallback className="bg-zinc-800 text-zinc-400 font-bold">
                                                {address?.slice(0, 2)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="text-lg font-bold text-white leading-none mb-1">
                                                {ensName || "Anonymous User"}
                                            </h3>
                                            <p className="text-xs text-zinc-500 font-mono bg-zinc-950 px-2 py-1 rounded border border-zinc-800 inline-block">
                                                {address?.slice(0, 6)}...{address?.slice(-4)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 flex flex-col items-center justify-center">
                                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Status</span>
                                            <div className="flex items-center gap-1.5">
                                                <span className="relative flex h-2 w-2">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                                </span>
                                                <span className="text-emerald-400 text-sm font-bold">Active</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 bg-zinc-900/50 rounded-full px-3 py-1 border border-zinc-800">
                                            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                                            <span className="text-xs font-medium text-zinc-300">
                                                {/* CALL THE FUNCTION HERE */}
                                                {isConnected ? getNetworkName(chain) : 'Not Connected'}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Transaction History Table */}
                            <div className="h-[400px]">
                                <RecentTransactions />
                            </div>

                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}