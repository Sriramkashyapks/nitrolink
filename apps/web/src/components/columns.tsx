"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpRight, ArrowDownLeft } from "lucide-react"
import { ENSOrAddress } from "./ens-or-address"

// This type is used to define the shape of our data.
export type Transaction = {
    _id: string
    type: string
    asset: string
    amount: string
    status: string
    createdAt: string
    userAddress: string
    recipientAddress?: string  // Optional for backward compatibility
    txHash: string
}

export const columns: ColumnDef<Transaction>[] = [
    {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => {
            if (!row?.original) return null;
            const type = row.getValue("type") as string;
            if (!type) return null;
            return (
                <div className="font-medium flex items-center gap-2 whitespace-nowrap">
                    {type === 'Zap' ? (
                        <ArrowUpRight className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    ) : (
                        <ArrowDownLeft className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    )}
                    <span className="truncate">{type}</span>
                </div>
            )
        },
    },
    {
        accessorKey: "asset",
        header: "Asset",
        cell: ({ row }) => {
            return <div className="text-zinc-300 truncate">{row.getValue("asset")}</div>
        }
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            return (
                <div className={`text-xs px-2 py-1 rounded-full inline-block whitespace-nowrap ${status === 'Success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800 text-zinc-400'
                    }`}>
                    {status}
                </div>
            )
        }
    },
    {
        accessorKey: "recipientAddress",
        header: "Recipient",
        cell: ({ row }) => {
            const recipient = row.original.recipientAddress
            if (!recipient) return <div className="text-zinc-600 text-xs">-</div>
            return <div className="max-w-[120px] sm:max-w-[150px]"><ENSOrAddress address={recipient} /></div>
        }
    },
    {
        accessorKey: "amount",
        header: () => <div className="text-right">Amount</div>,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("amount"))
            const formatted = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
            }).format(amount)

            return <div className="text-right font-mono text-emerald-400 font-bold whitespace-nowrap">+{formatted}</div>
        },
    },
    {
        accessorKey: "txHash",
        header: "Transaction Hash",
        cell: ({ row }) => {
            const txHash = row.getValue("txHash") as string
            const shortHash = `${txHash.slice(0, 6)}...${txHash.slice(-4)}`
            return (
                <div className="text-zinc-300 font-mono text-xs" title={txHash}>
                    <span className="hidden sm:inline">{shortHash}</span>
                    <span className="sm:hidden">{txHash.slice(0, 8)}...</span>
                </div>
            )
        }
    }
]
