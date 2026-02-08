'use client';

import { useEnsAddress, useEnsName, useEnsAvatar } from 'wagmi';
import { normalize } from 'viem/ens';
import { useState, useEffect } from 'react';
import { mainnet } from 'wagmi/chains';

/**
 * Custom hook to resolve ENS names to addresses
 * Supports both .eth names and reverse resolution
 */
export function useENSResolution(input: string | undefined) {
    const [isValidENS, setIsValidENS] = useState(false);
    const [normalizedName, setNormalizedName] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (!input) {
            setIsValidENS(false);
            setNormalizedName(undefined);
            return;
        }

        // Check if it's an ENS name (ends with .eth or contains .eth.)
        const isENSFormat = input.endsWith('.eth') || input.includes('.eth.');

        if (isENSFormat) {
            try {
                // Try to normalize the ENS name
                const normalized = normalize(input);
                setNormalizedName(normalized);
                setIsValidENS(true);
            } catch (error) {
                console.error('ENS normalization failed:', error);
                setIsValidENS(false);
                setNormalizedName(undefined);
            }
        } else {
            setIsValidENS(false);
            setNormalizedName(undefined);
        }
    }, [input]);

    const { data: resolvedAddress, isLoading } = useEnsAddress({
        name: normalizedName,
        chainId: mainnet.id,
    });

    return {
        address: resolvedAddress,
        isLoading,
        isENS: isValidENS,
    };
}

/**
 * Hook to get ENS data for an address
 */
export function useENSProfile(address: `0x${string}` | undefined) {
    const { data: ensName } = useEnsName({
        address,
        chainId: mainnet.id,
    });

    const { data: ensAvatar } = useEnsAvatar({
        name: ensName!,
        chainId: mainnet.id,
    });

    return {
        name: ensName,
        avatar: ensAvatar,
    };
}

/**
 * Custom hook to read ENS text records for DeFi preferences
 * This is the CREATIVE part - storing user preferences on ENS!
 */
export function useENSPreferences(ensName: string | null | undefined) {
    const [preferences, setPreferences] = useState<{
        defaultSlippage?: string;
        favoriteTokens?: string;
        preferredChain?: string;
        socialTwitter?: string;
        socialGithub?: string;
    } | null>(null);

    // In a real implementation, you would use publicClient.getEnsText()
    // For now, we'll create a placeholder that can be expanded
    useEffect(() => {
        if (ensName) {
            // TODO: Implement actual ENS text record reading
            // Example keys to read:
            // - 'defi.slippage' - default slippage tolerance
            // - 'defi.tokens' - comma-separated favorite tokens
            // - 'defi.chain' - preferred chain ID
            setPreferences({
                defaultSlippage: '0.5', // Default fallback
            });
        }
    }, [ensName]);

    return preferences;
}
