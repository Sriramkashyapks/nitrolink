'use client';

import { useState, useEffect, useRef } from 'react';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi'; // Added for Settlement
import { parseEther } from 'viem'; // Added for Settlement
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Zap, Play, Square, Banknote, Clock, Loader2 } from 'lucide-react'; // Added Loader2
import { toast } from 'sonner';
import { io, Socket } from 'socket.io-client';

export function FlashStreamWidget() {
    const { address } = useAccount();
    const { sendTransactionAsync } = useSendTransaction(); // Hook for sending crypto

    const [recipient, setRecipient] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [streamedAmount, setStreamedAmount] = useState(0);
    const [isSettling, setIsSettling] = useState(false);

    // Ref to hold the socket connection so it persists across renders
    const socketRef = useRef<Socket | null>(null);

    // 1. Initialize Socket Connection
    useEffect(() => {
        // Connect to your NestJS Backend
        socketRef.current = io('http://localhost:5001');

        socketRef.current.on('connect', () => {
            console.log("Connected to Yellow State Node:", socketRef.current?.id);
        });

        // LISTEN for updates from the backend
        socketRef.current.on('balance_update', (data) => {
            setStreamedAmount(data.balance);
        });

        return () => {
            socketRef.current?.disconnect();
        };
    }, []);

    const handleStartStream = async () => {
        if (!address) return toast.error("Connect Wallet first");
        const cleanRecipient = recipient.trim();
        if (!cleanRecipient.includes('0x')) return toast.error("Invalid address");

        // TELL BACKEND TO START
        if (socketRef.current) {
            socketRef.current.emit('start_stream', {
                recipient: cleanRecipient,
                sender: address,
                rate: 0.0001 // Sending fixed rate for demo
            });
            setIsStreaming(true);
            toast.success("Yellow State Channel Active! ⚡");
        }
    };

    const handleStopStream = () => {
        if (socketRef.current) {
            socketRef.current.emit('stop_stream');
            setIsStreaming(false);
            toast.info("Channel Paused. Ready to settle.");
        }
    };

    // 2. REAL SETTLEMENT (Base Sepolia)
    const handleSettle = async () => {
        if (streamedAmount <= 0) return;
        setIsSettling(true);

        try {
            const finalAmount = streamedAmount.toFixed(6); // Format correctly
            toast.loading("Settling on Base Sepolia...");

            const cleanRecipient = recipient.trim();
            // A. Trigger Wallet Transaction
            const txHash = await sendTransactionAsync({
                to: cleanRecipient as `0x${string}`,
                value: parseEther(finalAmount), // Convert USDC amount to Wei (mocking USDC as ETH for testnet simplicity)
            });

            // B. Save to DB (Optional but good for history)
            await fetch('http://localhost:5001/transaction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userAddress: address,
                    type: 'Stream Settlement',
                    asset: 'USDC',
                    amount: finalAmount,
                    txHash: txHash,
                    status: 'Success'
                })
            });

            toast.dismiss();
            toast.success(`Settled Successfully!`, {
                description: `Tx: ${txHash.slice(0, 10)}...`
            });

            // Reset
            setStreamedAmount(0);
            setRecipient('');

        } catch (error) {
            console.error(error);
            toast.error("Settlement Failed");
        } finally {
            setIsSettling(false);
        }
    };

    return (
        <Card className="h-full bg-zinc-900 border-zinc-800 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-yellow-500/10 blur-[50px] rounded-full group-hover:bg-yellow-500/20 transition-all duration-700 pointer-events-none" />

            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-400">
                    <Zap className="h-5 w-5 fill-yellow-400" />
                    Flash Stream
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* TICKER */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 flex flex-col items-center justify-center relative overflow-hidden min-h-[140px]">
                    {isStreaming && (
                        <div className="absolute inset-0 bg-yellow-500/5 animate-pulse" />
                    )}

                    <span className="text-zinc-500 text-xs uppercase tracking-wider mb-2">
                        Real-Time Value
                    </span>
                    <div className="text-4xl md:text-5xl font-mono font-bold text-white tabular-nums tracking-tight z-10">
                        ${streamedAmount.toFixed(6)}
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-emerald-400 z-10 h-5">
                        {isStreaming ? (
                            <>
                                <Clock className="h-3 w-3 animate-spin" />
                                <span className="animate-pulse">Streaming via Yellow Node</span>
                            </>
                        ) : (
                            <span className="text-zinc-600">Channel Idle</span>
                        )}
                    </div>
                </div>

                {/* CONTROLS */}
                <div className="space-y-4">
                    <div>
                        <Input
                            placeholder="Recipient (0x...)"
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value.trim())}
                            disabled={isStreaming}
                            error={!recipient.includes('0x')}
                            className="bg-zinc-950 border-zinc-800 focus:ring-yellow-500/50 text-white"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {!isStreaming ? (
                            <Button
                                onClick={handleStartStream}
                                disabled={isSettling}
                                className="col-span-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold h-12"
                            >
                                <Play className="h-4 w-4 mr-2 fill-black" /> Start Stream
                            </Button>
                        ) : (
                            <Button
                                variant="destructive"
                                onClick={handleStopStream}
                                className="col-span-2 bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 h-12"
                            >
                                <Square className="h-4 w-4 mr-2 fill-white" /> Pause Stream
                            </Button>
                        )}

                        {/* SETTLE BUTTON - Only shows if we have money pending and stream is paused */}
                        {!isStreaming && streamedAmount > 0 && (
                            <Button
                                onClick={handleSettle}
                                disabled={isSettling}
                                className="col-span-2 bg-emerald-500 hover:bg-emerald-600 text-black font-bold animate-in fade-in zoom-in"
                            >
                                {isSettling ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Banknote className="h-4 w-4 mr-2" />
                                )}
                                Settle & Pay (${streamedAmount.toFixed(4)})
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}