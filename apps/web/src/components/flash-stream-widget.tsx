'use client';

import { useState, useEffect, useRef } from 'react';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi'; // Added for Settlement
import { parseEther } from 'viem'; // Added for Settlement
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Zap, Play, Square, Banknote, Clock, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { io, Socket } from 'socket.io-client';
import { useENSResolution } from '@/hooks/useENS';
import { apiUrl } from '@/lib/config';

export function FlashStreamWidget() {
    const { address } = useAccount();
    const { sendTransactionAsync } = useSendTransaction(); // Hook for sending crypto

    const [recipient, setRecipient] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [streamedAmount, setStreamedAmount] = useState(0);
    const [isSettling, setIsSettling] = useState(false);

    // Ref to hold the socket connection so it persists across renders
    const socketRef = useRef<Socket | null>(null);

    // ENS Resolution for recipient
    const { address: resolvedENSAddress, isLoading: isResolvingENS, isENS } = useENSResolution(recipient);
    const finalRecipientAddress = isENS && resolvedENSAddress ? resolvedENSAddress : recipient;

    // 1. Initialize Socket Connectionrecipient
    useEffect(() => {
        // Connect to your NestJS Backend
        socketRef.current = io(apiUrl);

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

        // Validate recipient - either valid address or resolved ENS
        if (!finalRecipientAddress || !finalRecipientAddress.startsWith('0x')) {
            if (isENS && isResolvingENS) {
                return toast.error("Still resolving ENS name...");
            } else if (isENS && !resolvedENSAddress) {
                return toast.error("Could not resolve ENS name");
            } else {
                return toast.error("Please enter a valid address or ENS name");
            }
        }

        // TELL BACKEND TO START
        if (socketRef.current) {
            socketRef.current.emit('start_stream', {
                recipient: finalRecipientAddress, // Use resolved ENS address!
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

            // A. Trigger Wallet Transaction
            const txHash = await sendTransactionAsync({
                to: finalRecipientAddress as `0x${string}`, // Use resolved ENS address!
                value: parseEther(finalAmount), // Convert USDC amount to Wei (mocking USDC as ETH for testnet simplicity)
            });

            // B. Save to DB (Optional but good for history)
            const transactionData = {
                userAddress: address,
                recipientAddress: finalRecipientAddress, // Save resolved address!
                type: 'Stream Settlement',
                asset: 'USDC',
                amount: finalAmount,
                txHash: txHash,
                status: 'Success'
            };

            await fetch(`${apiUrl}/transaction`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(transactionData)
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
        <Card className="h-full bg-zinc-900 border-zinc-800 text-white relative overflow-hidden group flex flex-col max-w-full">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-yellow-500/10 blur-[50px] rounded-full group-hover:bg-yellow-500/20 transition-all duration-700 pointer-events-none" />

            <CardHeader className="border-b border-zinc-800/50">
                <CardTitle className="flex items-center gap-2 text-yellow-400">
                    <Zap className="h-5 w-5 fill-yellow-400" />
                    Flash Stream
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3 sm:space-y-4 flex-1 flex flex-col justify-between p-4 sm:p-6">
                {/* TICKER - Reduced size */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 sm:p-4 flex flex-col items-center justify-center relative overflow-hidden min-h-[120px] sm:min-h-[100px]">
                    {isStreaming && (
                        <div className="absolute inset-0 bg-yellow-500/5 animate-pulse" />
                    )}

                    <span className="text-zinc-500 text-[10px] sm:text-xs uppercase tracking-wider mb-1">
                        Real-Time Value
                    </span>
                    <div className="text-3xl sm:text-4xl md:text-5xl font-mono font-bold text-white tabular-nums tracking-tight z-10 truncate max-w-full px-2">
                        ${streamedAmount.toFixed(6)}
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 mt-1 text-[10px] sm:text-xs text-emerald-400 z-10 h-5">
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

                {/* Divider line */}
                <div className="h-px bg-gradient-to-r from-transparent via-zinc-700/50 to-transparent"></div>

                {/* CONTROLS */}
                <div className="space-y-3 sm:space-y-4">
                    <div className="bg-zinc-950 p-2.5 sm:p-3 rounded-lg border border-zinc-800">
                        <p className="text-[9px] sm:text-[10px] text-zinc-500 uppercase tracking-widest mb-1 font-bold">
                            Recipient (Address or ENS)
                        </p>
                        <div className="flex items-center gap-2 min-w-0">
                            <Input
                                placeholder="0x... or vitalik.eth"
                                value={recipient}
                                onChange={(e) => setRecipient(e.target.value.trim())}
                                disabled={isStreaming}
                                className="bg-transparent border-none text-xs sm:text-sm p-0 h-auto focus-visible:ring-0 text-yellow-400 font-mono flex-1 min-w-0 truncate"
                            />
                            {isResolvingENS && (
                                <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin text-blue-400 flex-shrink-0" />
                            )}
                            {isENS && !isResolvingENS && resolvedENSAddress && (
                                <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500 flex-shrink-0" />
                            )}
                            {isENS && !isResolvingENS && !resolvedENSAddress && recipient && (
                                <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500 flex-shrink-0" />
                            )}
                        </div>
                        {/* Show resolved address below ENS name */}
                        {isENS && resolvedENSAddress && (
                            <p className="text-[9px] sm:text-[10px] text-zinc-600 mt-1 font-mono">
                                → {resolvedENSAddress.slice(0, 6)}...{resolvedENSAddress.slice(-4)}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        {!isStreaming ? (
                            <Button
                                onClick={handleStartStream}
                                disabled={isSettling}
                                className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-bold h-11 sm:h-12 text-sm sm:text-base"
                            >
                                <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2 fill-black" /> Start Stream
                            </Button>
                        ) : (
                            <Button
                                variant="destructive"
                                onClick={handleStopStream}
                                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 h-11 sm:h-12 text-sm sm:text-base"
                            >
                                <Square className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2 fill-white" /> Pause Stream
                            </Button>
                        )}

                        {/* SETTLE BUTTON - Shows when paused with balance */}
                        {!isStreaming && streamedAmount > 0 && (
                            <Button
                                onClick={handleSettle}
                                disabled={isSettling}
                                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-black font-bold animate-in fade-in zoom-in h-11 sm:h-12 text-sm sm:text-base"
                            >
                                {isSettling ? (
                                    <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2 animate-spin" />
                                ) : (
                                    <Banknote className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                                )}
                                Settle
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}