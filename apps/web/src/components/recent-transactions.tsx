'use client';

import { useAccount } from 'wagmi';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Loader2 } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { columns, Transaction } from './columns';
import { useEffect, useRef } from 'react';

interface TransactionResponse {
    transactions: Transaction[];
    total: number;
    hasMore: boolean;
}

export function RecentTransactions() {
    const { address } = useAccount();
    const observerRef = useRef<HTMLDivElement>(null);

    const {
        data,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery<TransactionResponse>({
        queryKey: ['transactions', address],
        queryFn: async ({ pageParam = 0 }) => {
            if (!address) return { transactions: [], total: 0, hasMore: false };
            const res = await fetch(
                `http://localhost:5001/transactions?address=${address}&limit=5&skip=${pageParam}`
            );
            return res.json();
        },
        getNextPageParam: (lastPage, allPages) => {
            if (!lastPage.hasMore) return undefined;
            return allPages.reduce((acc, page) => acc + page.transactions.length, 0);
        },
        enabled: !!address,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        initialPageParam: 0,
    });

    // Flatten all pages into a single array and filter out any invalid entries
    const transactions = (data?.pages.flatMap((page) => page.transactions) ?? []).filter(Boolean);

    // Intersection Observer for infinite scroll
    useEffect(() => {
        if (!observerRef.current || !hasNextPage || isFetchingNextPage) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting && hasNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(observerRef.current);

        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    return (
        <Card className="h-full bg-zinc-900 border-zinc-800 text-white flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-zinc-100">
                    <Activity className="h-5 w-5 text-blue-500" />
                    Recent Activity
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
                {isLoading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
                    </div>
                ) : (
                    <div className="h-full max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900">
                        <DataTable columns={columns} data={transactions} />

                        {/* Intersection observer target */}
                        {hasNextPage && (
                            <div ref={observerRef} className="py-4 text-center">
                                {isFetchingNextPage ? (
                                    <Loader2 className="h-5 w-5 animate-spin text-zinc-500 mx-auto" />
                                ) : (
                                    <div className="text-zinc-600 text-sm">Scroll for more</div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}