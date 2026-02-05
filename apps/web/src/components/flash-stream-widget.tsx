'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Zap, Play, Square, Banknote, Clock } from 'lucide-react';
import { toast } from 'sonner';

export function FlashStreamWidget() {
    const { address } = useAccount();
    const [recipient, setRecipient] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [streamedAmount, setStreamedAmount] = useState(0);

    // MOCK LOGIC (We replace this with WebSockets in Task 2)
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isStreaming) {
            interval = setInterval(() => {
                setStreamedAmount(prev => prev + 0.000023); // Random "Flow Rate"
            }, 100); // Fast tick for visual effect
        }
        return () => clearInterval(interval);
    }, [isStreaming]);

    const handleStartStream = async () => {
        if (!address) {
            toast.error("Connect Wallet first");
            return;
        }
        if (!recipient.includes('0x') && !recipient.includes('.eth')) {
            toast.error("Invalid address");
            return;
        }

        // Simulate Signature
        toast.info("Opening State Channel...");
        setTimeout(() => {
            setIsStreaming(true);
            toast.success("State Channel Active! ⚡");
        }, 1000);
    };

    const handleSettle = async () => {
        setIsStreaming(false);
        // Real Settlement comes in Task 3
        toast.success(`Settled $${streamedAmount.toFixed(6)} on Base Sepolia!`);
        setStreamedAmount(0);
    };

    return (
        <Card className="h-full bg-zinc-900 border-zinc-800 text-white relative overflow-hidden group shadow-2xl shadow-yellow-500/5">
            {/* Yellow Glow for Branding */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-yellow-500/10 blur-[50px] rounded-full group-hover:bg-yellow-500/20 transition-all duration-700 pointer-events-none" />

            {isStreaming && (
                <div className="absolute inset-0 border-2 border-yellow-500/20 rounded-xl animate-pulse pointer-events-none" />
            )}

            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-yellow-400 font-bold tracking-tight">
                    <Zap className="h-5 w-5 fill-yellow-400" />
                    Flash Stream
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* THE TICKER */}
                <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-8 flex flex-col items-center justify-center relative shadow-inner">
                    {isStreaming && (
                        <div className="absolute inset-0 bg-yellow-500/[0.02] animate-pulse" />
                    )}

                    <span className="text-zinc-600 text-[10px] uppercase font-bold tracking-[0.3em] mb-4">
                        Current Yield Flow
                    </span>
                    <div className="text-5xl md:text-6xl font-mono font-black text-white tabular-nums tracking-tighter z-10 drop-shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                        ${streamedAmount.toFixed(6)}
                    </div>

                    <div className="flex items-center gap-2 mt-4 text-[10px] font-mono font-bold z-10 h-6">
                        {isStreaming ? (
                            <div className="flex items-center gap-2 bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full border border-yellow-500/20">
                                <Clock className="h-3 w-3 animate-spin" />
                                <span className="animate-pulse">Active Channel: 42.1k/s</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 bg-zinc-900 text-zinc-500 px-3 py-1 rounded-full border border-zinc-800">
                                <span className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
                                <span>STANDBY MODE</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* CONTROLS */}
                <div className="space-y-4">
                    <div className="relative">
                        <Input
                            placeholder="Recipient (0x... or name.eth)"
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                            disabled={isStreaming}
                            className="bg-zinc-950 border-zinc-800 focus:ring-yellow-500/50 text-white h-12 pl-4 font-mono text-sm transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {!isStreaming ? (
                            <Button
                                onClick={handleStartStream}
                                className="col-span-2 bg-yellow-500 hover:bg-yellow-400 text-black font-black h-14 text-lg shadow-lg shadow-yellow-500/20 transition-all active:scale-[0.98]"
                            >
                                <Play className="h-5 w-5 mr-2 fill-black" /> OPEN STREAM
                            </Button>
                        ) : (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsStreaming(false)}
                                    className="bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700 h-14 font-bold"
                                >
                                    <Square className="h-4 w-4 mr-2 fill-white" /> Pause
                                </Button>
                                <Button
                                    onClick={handleSettle}
                                    className="bg-emerald-500 hover:bg-emerald-600 text-black font-black h-14"
                                >
                                    <Banknote className="h-5 w-5 mr-2" /> SETTLE
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}