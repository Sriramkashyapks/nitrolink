'use client';

import { ConnectKitButton } from 'connectkit';
import { useAccount, useEnsName, useEnsAvatar } from 'wagmi';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';

export default function Home() {
    const { address, isConnected } = useAccount();

    // We force chainId: 1 (Mainnet) for ENS because Arc Testnet doesn't have ENS records.
    const { data: ensName, isLoading: isEnsLoading } = useEnsName({
        address,
        chainId: 1
    });

    const { data: ensAvatar } = useEnsAvatar({
        name: ensName!,
        chainId: 1
    });

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-white p-6">
            {/* Top right connect button */}
            <div className="absolute top-6 right-6">
                <ConnectKitButton />
            </div>

            <div className="z-10 w-full max-w-md items-center justify-between font-mono text-sm">
                {!isConnected ? (
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                            NitroLink
                        </h1>
                        <p className="text-zinc-400">Connect wallet to view your identity.</p>
                    </div>
                ) : (
                    <Card className="w-full bg-zinc-900 border-zinc-800 shadow-2xl">
                        <CardHeader className="flex flex-col items-center space-y-2 pb-2">
                            <Avatar className="h-24 w-24 ring-2 ring-emerald-500/50">
                                <AvatarImage src={ensAvatar || ''} />
                                <AvatarFallback className="bg-zinc-800 text-zinc-400">
                                    {address?.slice(0, 2)}
                                </AvatarFallback>
                            </Avatar>

                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-white">
                                    {isEnsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : (ensName || "Anonymous User")}
                                </h2>
                                <p className="text-xs text-zinc-500 mt-1 bg-zinc-950 px-2 py-1 rounded-full">
                                    {address}
                                </p>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-4 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-zinc-950 p-4 rounded-lg text-center border border-zinc-800">
                                    <p className="text-zinc-500 text-xs uppercase tracking-wider">Network</p>
                                    <p className="text-emerald-400 font-bold">Arc Testnet</p>
                                </div>
                                <div className="bg-zinc-950 p-4 rounded-lg text-center border border-zinc-800">
                                    <p className="text-zinc-500 text-xs uppercase tracking-wider">Identity</p>
                                    <p className="text-blue-400 font-bold">ENS Mainnet</p>
                                </div>
                            </div>

                            <div className="h-24 flex items-center justify-center border-2 border-dashed border-zinc-800 rounded-lg text-zinc-600">
                                Zap & Stream Widgets Coming Soon...
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </main>
    );
}