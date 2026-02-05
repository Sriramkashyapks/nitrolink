'use client';

import { useAccount } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Loader2 } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { columns, Transaction } from './columns';

export function RecentTransactions() {
    const { address } = useAccount();

    const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
        queryKey: ['transactions', address],
        queryFn: async () => {
            if (!address) return [];
            const res = await fetch(`http://localhost:5001/transactions?address=${address}`);
            return res.json();
        },
        enabled: !!address,
        // Refetch when component mounts
        refetchOnMount: true,
        // Refetch when window regains focus
        refetchOnWindowFocus: true,
    });

    return (
        <Card className="h-full bg-zinc-900 border-zinc-800 text-white">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-zinc-100">
                    <Activity className="h-5 w-5 text-blue-500" />
                    Recent Activity
                </CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
                    </div>
                ) : (
                    <DataTable columns={columns} data={transactions} />
                )}
            </CardContent>
        </Card>
    );
}