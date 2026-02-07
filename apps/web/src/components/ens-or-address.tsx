'use client';

import { useENSProfile } from '@/hooks/useENS';

interface ENSOrAddressProps {
    address: string;
}

export function ENSOrAddress({ address }: ENSOrAddressProps) {
    const { name } = useENSProfile(address as `0x${string}`);

    if (name) {
        return (
            <div className="flex flex-col">
                <span className="text-emerald-400 font-medium">{name}</span>
                <span className="text-[10px] text-zinc-600 font-mono">
                    {address.slice(0, 6)}...{address.slice(-4)}
                </span>
            </div>
        );
    }

    return (
        <span className="text-zinc-300 font-mono text-xs">
            {address.slice(0, 6)}...{address.slice(-4)}
        </span>
    );
}
