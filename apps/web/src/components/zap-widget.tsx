'use client';

import { useState, useEffect } from 'react';
import { useWalletClient, useAccount } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { getQuote, executeRoute } from '@lifi/sdk';
import { parseEther } from 'viem';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, ArrowRight, Wallet, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import Confetti from 'react-confetti';
import useSound from 'use-sound';
import { toast } from 'sonner';
import { useENSResolution } from '@/hooks/useENS';
import { apiUrl } from '@/lib/config';

// REAL CONFIG: Ethereum Sepolia -> Arbitrum Sepolia
// We move money FROM where you have it (Sepolia)
const ZAP_CONFIG = {
    fromChain: 11155111, // Ethereum Sepolia (Source)
    fromToken: '0x0000000000000000000000000000000000000000', // Native ETH
    toChain: 84532, // Base Sepolia (Destination)
    toToken: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // USDC on Base Sepolia
};

export function ZapWidget() {
    const { data: signer } = useWalletClient();
    const { address } = useAccount();
    const queryClient = useQueryClient();

    const [amount, setAmount] = useState('0.01');
    const [recipientAddress, setRecipientAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [showConfetti, setShowConfetti] = useState(false);

    const [playCash] = useSound('/cha-ching.mp3', { volume: 0.5 });

    // ENS Resolution for recipient
    const { address: resolvedENSAddress, isLoading: isResolvingENS, isENS } = useENSResolution(recipientAddress);

    // Final address to use - resolved ENS or direct address
    const finalRecipientAddress = isENS && resolvedENSAddress ? resolvedENSAddress : recipientAddress;

    const handleZap = async () => {
        if (!address || !signer) {
            toast.error("Please connect your wallet first");
            return;
        }

        // Validate recipient - either valid address or resolved ENS
        if (!finalRecipientAddress || !finalRecipientAddress.startsWith('0x')) {
            if (isENS && isResolvingENS) {
                toast.error("Still resolving ENS name...");
            } else if (isENS && !resolvedENSAddress) {
                toast.error("Could not resolve ENS name");
            } else {
                toast.error("Please enter a valid address or ENS name");
            }
            return;
        }

        setLoading(true);
        setStatus('Finding best route...');

        try {
            // PHASE 1: Try Real Cross-Chain Quote
            let quote;
            let usedCrossChain = false;

            try {
                quote = await getQuote({
                    fromChain: ZAP_CONFIG.fromChain,
                    fromToken: ZAP_CONFIG.fromToken,
                    fromAddress: address,
                    fromAmount: (Number(amount) * 10 ** 18).toString(),
                    toChain: ZAP_CONFIG.toChain,
                    toToken: ZAP_CONFIG.toToken,
                    toAddress: finalRecipientAddress, // Use resolved ENS address!
                });

                usedCrossChain = true;
            } catch (apiError: any) {
                console.error("❌ LiFi API Error:", apiError.message);
                quote = null;
            }

            let txHash = '0xPendingTransaction';

            // PHASE 2: Execute Transaction
            if (quote && usedCrossChain) {
                setStatus('Please confirm transaction in wallet...');
                const tx = await executeRoute(signer as any, quote as any);
                txHash = tx.steps[0]?.execution?.process[0]?.txHash || txHash;
            } else {
                setStatus('Please confirm transfer in wallet...');

                txHash = await signer.sendTransaction({
                    to: finalRecipientAddress as `0x${string}`, // Use resolved ENS address!
                    value: parseEther(amount),
                });
            }

            // PHASE 3: Success & Save
            setStatus('Transaction Complete! 🎉');
            playCash();
            setShowConfetti(true);

            // Save Transaction to DB
            await fetch(`${apiUrl}/transaction`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userAddress: address,
                    recipientAddress: finalRecipientAddress, // Save the resolved address
                    type: 'Zap',
                    asset: 'ETH',
                    amount: amount,
                    txHash: txHash,
                    status: 'Success'
                })
            });

            queryClient.invalidateQueries({ queryKey: ['transactions', address] });
            setTimeout(() => {
                setShowConfetti(false);
                setStatus('');
            }, 5000);

        } catch (error: any) {
            console.error("Zap failed:", error);
            toast.error(error.message?.includes('User rejected') ? "Transaction cancelled" : "Zap failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full h-full bg-zinc-900 border-zinc-800 text-white relative overflow-hidden flex flex-col">
            {showConfetti && <Confetti numberOfPieces={200} recycle={false} />}

            <CardHeader className="border-b border-zinc-800/50">
                <CardTitle className="flex items-center gap-2 text-emerald-400">
                    <Zap className="h-5 w-5 fill-emerald-400" />
                    Rapid Zap
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
                {/* 1. Amount Field */}
                <div className="flex-1 flex items-center gap-4 bg-zinc-950 p-4 rounded-xl border border-zinc-800 min-h-[100px]">
                    <div className="flex-1">
                        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Pay (Sepolia)</p>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="bg-transparent border-none text-3xl md:text-4xl p-0 h-auto focus-visible:ring-0 text-white font-bold font-mono tracking-tight tabular-nums"
                            />
                            <span className="font-bold text-zinc-400 text-lg md:text-xl mt-1">ETH</span>
                        </div>
                    </div>
                    <ArrowRight className="text-zinc-600 h-5 w-5" />
                    <div className="flex-1 text-right">
                        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Receive (Cross-Chain)</p>
                        <div className="flex items-center justify-end gap-2">
                            <span className="text-3xl md:text-4xl font-bold text-white font-mono tracking-tight tabular-nums">
                                ~{(Number(amount) * 2800).toFixed(2)}
                            </span>
                            <span className="font-bold text-blue-400 text-lg md:text-xl mt-1">USDC</span>
                        </div>
                    </div>
                </div>

                {/* Divider line */}
                <div className="h-px bg-gradient-to-r from-transparent via-zinc-700/50 to-transparent"></div>

                {/* CONTROLS container to match Flash Stream layout */}
                <div className="space-y-4">
                    {/* 2. Recipient Field with ENS Support */}
                    <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1 font-bold">
                            Recipient (Address or ENS)
                        </p>
                        <div className="flex items-center gap-2">
                            <Input
                                value={recipientAddress}
                                onChange={(e) => setRecipientAddress(e.target.value.trim())}
                                placeholder="0x... or vitalik.eth"
                                className="bg-transparent border-none text-sm p-0 h-auto focus-visible:ring-0 text-emerald-400 font-mono flex-1"
                            />
                            {isResolvingENS && (
                                <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                            )}
                            {isENS && !isResolvingENS && resolvedENSAddress && (
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            )}
                            {isENS && !isResolvingENS && !resolvedENSAddress && recipientAddress && (
                                <AlertCircle className="h-4 w-4 text-red-500" />
                            )}
                        </div>
                        {/* Show resolved address below ENS name */}
                        {isENS && resolvedENSAddress && (
                            <p className="text-[10px] text-zinc-600 mt-1 font-mono">
                                → {resolvedENSAddress.slice(0, 6)}...{resolvedENSAddress.slice(-4)}
                            </p>
                        )}
                    </div>

                    <Button
                        onClick={handleZap}
                        disabled={loading || !amount || Number(amount) <= 0}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold h-12"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" /> {status}
                            </span>
                        ) : (
                            "Zap Money Instantly ⚡"
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}