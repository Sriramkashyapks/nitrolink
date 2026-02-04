'use client';

import { useState } from 'react';
import { useWalletClient, useAccount } from 'wagmi';
import { getQuote, executeRoute } from '@lifi/sdk';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, ArrowRight, Wallet } from 'lucide-react';
import Confetti from 'react-confetti';
import useSound from 'use-sound';
import { toast } from 'sonner';

// Bridge configuration: We're swapping ETH on Sepolia to USDC on Arbitrum Sepolia
const ZAP_CONFIG = {
    fromChain: 11155111, // Sepolia testnet
    fromToken: '0x0000000000000000000000000000000000000000', // Native ETH (zero address means native token)
    toChain: 421614, // Arbitrum Sepolia testnet
    toToken: '0x75faf114eafb1BDbe2F031385358e1eE48e548bd', // USDC contract on Arb Sepolia
};

export function ZapWidget() {
    const { data: signer } = useWalletClient();
    const { address } = useAccount();

    const [amount, setAmount] = useState('0.01');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [showConfetti, setShowConfetti] = useState(false);

    // Play cash register sound on successful transaction
    const [playCash] = useSound('/cha-ching.mp3', { volume: 0.5 });

    const handleZap = async () => {
        // Make sure wallet is connected before doing anything
        if (!address || !signer) {
            toast.error("Please connect your wallet first");
            return;
        }

        setLoading(true);
        setStatus('Finding best route...');

        try {
            // Step 1: Get the best route for this swap from LiFi
            const quote = await getQuote({
                fromChain: ZAP_CONFIG.fromChain,
                fromToken: ZAP_CONFIG.fromToken,
                fromAddress: address,
                // Convert ETH amount to wei (multiply by 10^18)
                fromAmount: (Number(amount) * 10 ** 18).toString(),
                toChain: ZAP_CONFIG.toChain,
                toToken: ZAP_CONFIG.toToken,
                toAddress: address,
            });

            // Step 2: Execute the swap - this will prompt user to sign the transaction
            setStatus('Please confirm in your wallet...');
            await executeRoute(signer as any, quote as any);

            // Step 3: Transaction successful! Show celebration
            setStatus('Zap Complete! 🎉');
            playCash();
            setShowConfetti(true);

            // Hide confetti and reset status after 5 seconds
            setTimeout(() => {
                setShowConfetti(false);
                setStatus('');
            }, 5000);

        } catch (error: any) {
            console.error("Zap failed:", error);

            // Show user-friendly error message
            if (error.message?.includes('user rejected')) {
                toast.error("Transaction cancelled");
            } else {
                toast.error("Zap failed: " + (error.message || "Unknown error"));
            }

            setStatus('');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full bg-zinc-900 border-zinc-800 text-white relative overflow-hidden">
            {/* Confetti only shows on successful transactions */}
            {showConfetti && <Confetti numberOfPieces={200} recycle={false} />}

            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-400">
                    <Wallet className="h-5 w-5" />
                    Rapid Zap
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Swap input/output display */}
                <div className="flex items-center gap-2 bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                    {/* Source token (what you're sending) */}
                    <div className="flex-1">
                        <p className="text-xs text-zinc-500 mb-1">Send (Base Sepolia)</p>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="bg-transparent border-none text-xl p-0 h-auto focus-visible:ring-0 text-white"
                            />
                            <span className="font-bold text-zinc-400">ETH</span>
                        </div>
                    </div>

                    <ArrowRight className="text-zinc-600" />

                    {/* Destination token (what you'll receive) */}
                    <div className="flex-1 text-right">
                        <p className="text-xs text-zinc-500 mb-1">Receive (Sepolia)</p>
                        <div className="flex items-center justify-end gap-2">
                            {/* Rough estimate: ETH price ~$2800 */}
                            <span className="text-xl font-bold text-white">
                                ~{(Number(amount) * 2800).toFixed(2)}
                            </span>
                            <span className="font-bold text-blue-400">USDC</span>
                        </div>
                    </div>
                </div>

                {/* Action button */}
                <Button
                    onClick={handleZap}
                    disabled={loading || !amount || Number(amount) <= 0}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold h-12 text-lg"
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