'use client';

import { useState, useEffect } from 'react';
import { useAccount, useEnsName } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Loader2, Zap } from 'lucide-react';
import { readAllDeFiPreferences } from '@/lib/ens-preferences';

/**
 * ENS DeFi Preferences Panel
 * 
 * This component demonstrates the CREATIVE DeFi use case for ENS:
 * Reading user's DeFi preferences from their ENS text records
 * 
 * This makes settings portable across all DeFi apps!
 */
export function ENSPreferencesPanel() {
    const { address } = useAccount();
    const { data: ensName } = useEnsName({ address, chainId: 1 });

    const [preferences, setPreferences] = useState<{
        slippage: number;
        favoriteTokens: string[];
        defaultChain: number;
        defaultRecipient?: string;
    } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        async function loadPreferences() {
            if (ensName) {
                setIsLoading(true);
                try {
                    const prefs = await readAllDeFiPreferences(ensName);
                    setPreferences(prefs);
                } catch (error) {
                    console.error('Failed to load ENS preferences:', error);
                } finally {
                    setIsLoading(false);
                }
            }
        }

        loadPreferences();
    }, [ensName]);

    if (!ensName) {
        return null; // Only show if user has an ENS name
    }

    return (
        <Card className="bg-zinc-900 border-zinc-800 text-white">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-zinc-100">
                    <Settings className="h-5 w-5 text-purple-500" />
                    ENS DeFi Preferences
                    <Zap className="h-4 w-4 text-yellow-400" />
                </CardTitle>
                <p className="text-xs text-zinc-500">
                    Settings from <span className="text-purple-400 font-mono">{ensName}</span>
                </p>
            </CardHeader>

            <CardContent>
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
                    </div>
                ) : preferences ? (
                    <div className="space-y-4">
                        {/* Slippage Tolerance */}
                        <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-zinc-500 uppercase tracking-widest">
                                        Default Slippage
                                    </p>
                                    <p className="text-lg font-bold text-emerald-400">
                                        {preferences.slippage}%
                                    </p>
                                </div>
                                <div className="text-xs text-zinc-600 font-mono">
                                    defi.slippage
                                </div>
                            </div>
                        </div>

                        {/* Favorite Tokens */}
                        <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                            <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">
                                Favorite Tokens
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {preferences.favoriteTokens.length > 0 ? (
                                    preferences.favoriteTokens.map((token) => (
                                        <span
                                            key={token}
                                            className="px-2 py-1 bg-zinc-800 text-blue-400 rounded-md text-xs font-mono"
                                        >
                                            {token}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-zinc-600 text-xs">None set</span>
                                )}
                            </div>
                            <div className="mt-2 text-xs text-zinc-600 font-mono">
                                defi.favorite_tokens
                            </div>
                        </div>

                        {/* Preferred Chain */}
                        <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-zinc-500 uppercase tracking-widest">
                                        Preferred Chain
                                    </p>
                                    <p className="text-lg font-bold text-white">
                                        {preferences.defaultChain === 1 ? 'Ethereum' : `Chain ${preferences.defaultChain}`}
                                    </p>
                                </div>
                                <div className="text-xs text-zinc-600 font-mono">
                                    defi.default_chain
                                </div>
                            </div>
                        </div>

                        {/* Default Recipient */}
                        {preferences.defaultRecipient && (
                            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-zinc-500 uppercase tracking-widest">
                                            Default Recipient
                                        </p>
                                        <p className="text-sm font-mono text-purple-400">
                                            {preferences.defaultRecipient}
                                        </p>
                                    </div>
                                    <div className="text-xs text-zinc-600 font-mono">
                                        defi.default_recipient
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Info Box */}
                        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                            <p className="text-xs text-purple-300">
                                <strong>💡 Creative ENS Feature:</strong> These settings are stored in your ENS name's text records.
                                They follow you across all DeFi apps that support ENS preferences!
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 text-zinc-500 text-sm">
                        No ENS preferences found for {ensName}
                        <p className="text-xs text-zinc-600 mt-2">
                            You can set these in your ENS settings
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
