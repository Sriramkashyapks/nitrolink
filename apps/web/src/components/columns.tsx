"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpRight, ArrowDownLeft, Copy } from "lucide-react"
import { ENSOrAddress } from "./ens-or-address"
import { toast } from "sonner"

// This type is used to define the shape of our data.
export type Transaction = {
    _id: string
    type: string
    asset: string
    amount: string
    status: string
    createdAt: string
    userAddress: string
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

            const handleCopy = async () => {
                try {
                    await navigator.clipboard.writeText(txHash)
                    toast.success("Transaction hash copied!", {
                        description: `${txHash.slice(0, 10)}...${txHash.slice(-8)}`
                    })
                } catch (err) {
                    toast.error("Failed to copy to clipboard")
                }
            }

            return (
                <div
                    className="text-zinc-300 font-mono text-xs cursor-pointer hover:text-emerald-400 transition-colors group relative flex items-center gap-1.5"
                    onClick={handleCopy}
                    title={`${txHash}`}
                >
                    <span className="hidden sm:inline">{shortHash}</span>
                    <span className="sm:hidden">{txHash.slice(0, 8)}...</span>
                    <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </div>
            )
        }
    }
]
