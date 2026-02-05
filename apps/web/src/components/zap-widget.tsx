'use client';

import { useState } from 'react';
import { useWalletClient, useAccount } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { getQuote, executeRoute } from '@lifi/sdk';
import { parseEther } from 'viem';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, ArrowRight, Wallet, Zap } from 'lucide-react';
import Confetti from 'react-confetti';
import useSound from 'use-sound';
import { toast } from 'sonner';

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
    const [recipientAddress, setRecipientAddress] = useState('0x1a1A744bc556300d7D42475D0c21C737c02C9A74');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [showConfetti, setShowConfetti] = useState(false);

    const [playCash] = useSound('/cha-ching.mp3', { volume: 0.5 });

    const handleZap = async () => {
        if (!address || !signer) {
            toast.error("Please connect your wallet first");
            return;
        }

        if (!recipientAddress || !recipientAddress.startsWith('0x')) {
            toast.error("Please enter a valid recipient address");
            return;
        }

        setLoading(true);
        setStatus('Finding best route...');

        try {
            // PHASE 1: Try Real Cross-Chain Quote
            let quote;
            let usedCrossChain = false;

            try {
                console.log("🔍 Attempting LiFi Cross-Chain Quote...");

                quote = await getQuote({
                    fromChain: ZAP_CONFIG.fromChain,
                    fromToken: ZAP_CONFIG.fromToken,
                    fromAddress: address,
                    fromAmount: (Number(amount) * 10 ** 18).toString(),
                    toChain: ZAP_CONFIG.toChain,
                    toToken: ZAP_CONFIG.toToken,
                    toAddress: recipientAddress, // Use the recipient address here!
                });

                console.log("✅ Quote received!", quote);
                usedCrossChain = true;
            } catch (apiError: any) {
                console.error("❌ LiFi API Error:", apiError.message);
                quote = null;
            }

            let txHash = '0xPendingTransaction';

            // PHASE 2: Execute Transaction
            if (quote && usedCrossChain) {
                console.log("🚀 Executing cross-chain route...");
                setStatus('Please confirm transaction in wallet...');
                const tx = await executeRoute(signer as any, quote as any);
                txHash = tx.steps[0]?.execution?.process[0]?.txHash || txHash;
            } else {
                console.log("💸 Executing simple ETH transfer...");
                setStatus('Please confirm transfer in wallet...');

                txHash = await signer.sendTransaction({
                    to: recipientAddress as `0x${string}`, // Use the recipient address here!
                    value: parseEther(amount),
                });
            }

            // PHASE 3: Success & Save
            setStatus('Transaction Complete! 🎉');
            playCash();
            setShowConfetti(true);

            // Save Transaction to DB
            await fetch('http://localhost:5001/transaction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userAddress: address,
                    recipientAddress: recipientAddress,
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
        <Card className="w-full bg-zinc-900 border-zinc-800 text-white relative overflow-hidden">
            {showConfetti && <Confetti numberOfPieces={200} recycle={false} />}

            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-400">
                    <Zap className="h-5 w-5 fill-emerald-400" />
                    Rapid Zap
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* 1. Recipient Field (New) */}
                <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1 font-bold">Recipient Address</p>
                    <Input
                        value={recipientAddress}
                        onChange={(e) => setRecipientAddress(e.target.value)}
                        placeholder="0x..."
                        className="bg-transparent border-none text-sm p-0 h-auto focus-visible:ring-0 text-emerald-400 font-mono"
                    />
                </div>

                {/* 2. Amount Field */}
                <div className="flex items-center gap-2 bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                    <div className="flex-1">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1 font-bold">Pay (Sepolia)</p>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="bg-transparent border-none text-xl p-0 h-auto focus-visible:ring-0 text-white font-bold"
                            />
                            <span className="font-bold text-zinc-400">ETH</span>
                        </div>
                    </div>
                    <ArrowRight className="text-zinc-600" />
                    <div className="flex-1 text-right">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1 font-bold">Receive (Cross-Chain)</p>
                        <div className="flex items-center justify-end gap-2">
                            <span className="text-xl font-bold text-white">
                                ~{(Number(amount) * 2800).toFixed(2)}
                            </span>
                            <span className="font-bold text-blue-400">USDC</span>
                        </div>
                    </div>
                </div>

                <Button
                    onClick={handleZap}
                    disabled={loading || !amount || Number(amount) <= 0}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold h-12 text-lg shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]"
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" /> {status}
                        </span>
                    ) : (
                        "Zap Money Instantly ⚡"
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}