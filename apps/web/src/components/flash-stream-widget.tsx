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
        <Card className="h-full bg-zinc-900 border-zinc-800 text-white relative overflow-hidden group flex flex-col">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-yellow-500/10 blur-[50px] rounded-full group-hover:bg-yellow-500/20 transition-all duration-700 pointer-events-none" />

            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-400">
                    <Zap className="h-5 w-5 fill-yellow-400" />
                    Flash Stream
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
                {/* TICKER - Reduced size */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden min-h-[100px]">
                    {isStreaming && (
                        <div className="absolute inset-0 bg-yellow-500/5 animate-pulse" />
                    )}

                    <span className="text-zinc-500 text-xs uppercase tracking-wider mb-1">
                        Real-Time Value
                    </span>
                    <div className="text-4xl md:text-5xl font-mono font-bold text-white tabular-nums tracking-tight z-10">
                        ${streamedAmount.toFixed(6)}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-emerald-400 z-10 h-5">
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
                    <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1 font-bold">Recipient Address</p>
                        <Input
                            placeholder="0x..."
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value.trim())}
                            disabled={isStreaming}
                            error={!recipient.includes('0x')}
                            className="bg-transparent border-none text-lg p-0 h-auto focus-visible:ring-0 text-white font-mono"
                        />
                    </div>

                    <div className="flex flex-row gap-4">
                        {!isStreaming ? (
                            <Button
                                onClick={handleStartStream}
                                disabled={isSettling}
                                className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-bold h-12"
                            >
                                <Play className="h-4 w-4 mr-2 fill-black" /> Start Stream
                            </Button>
                        ) : (
                            <>
                                <Button
                                    variant="destructive"
                                    onClick={handleStopStream}
                                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 h-12"
                                >
                                    <Square className="h-4 w-4 mr-2 fill-white" /> Pause Stream
                                </Button>

                                {/* SETTLE BUTTON - Appears next to Pause when streaming implies we might want to settle while streaming? 
                                    Request said: "when the new button appears, place the settle and pay button right next to start/stream button after clicking it"
                                    Usually you pause then settle, but if user wants it next to it, we can show it if balance > 0.
                                    The logic below shows Settle button only if NOT streaming and balance > 0 in original code.
                                    If user wants it *while* streaming or just side-by-side with Pause, I should probably check logic. 
                                    Original request: "when i click on start stream and pause stream, another button below will appear account for that aswell... place the settle and pay button right next to start/stream button after clicking it".
                                    
                                    Wait, the original code only showed Settle if !isStreaming && streamedAmount > 0.
                                    If I click Start Stream -> Box changes to "Pause Stream".
                                    If I click Pause Stream -> Box changes to "Start Stream" AND "Settle" appears below (in original).
                                    User wants: When "Start" becomes "Pause", does he want Settle there? No, Settle needs balance.
                                    
                                    Let's stick to: When we are in the state where Settle is available (i.e. Paused with balance),
                                    Ensure "Start" and "Settle" are side-by-side? 
                                    OR
                                    Did user mean "Pause" and "Settle" side by side?
                                    "place the settle and pay button right next to start/stream button after clicking it"
                                    
                                    Case A: Stream Active. Button is "Pause".
                                    Case B: Stream Paused (Amount > 0). Buttons are "Start" and "Settle".
                                    
                                    Let's assume Case B is what needs side-by-side. 
                                    Original code had: grid-cols-2. Start was col-span-2 (full width). Settle was col-span-2 (full width) below it.
                                    So I will make them share the row.
                                */}

                            </>
                        )}

                        {/* CORRECT LOGIC FOR SIDE-BY-SIDE 'START' and 'SETTLE' (When Paused + Money) */}
                        {!isStreaming && streamedAmount > 0 && (
                            <Button
                                onClick={handleSettle}
                                disabled={isSettling}
                                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-black font-bold animate-in fade-in zoom-in h-12"
                            >
                                {isSettling ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Banknote className="h-4 w-4 mr-2" />
                                )}
                                Settle
                            </Button>
                        )}
                    </div>
                    {/* If we are just idle (no stream, no money), 'Start' needs to be full width. 
                        The flex container above will handle it if we make Start flex-1. 
                        But we removed the isStreaming check block from inside the flex container in my draft above.
                        Let's rewrite the logic cleanly in the replacement content.
                     */}
                </div>
            </CardContent>
        </Card>
    );
}