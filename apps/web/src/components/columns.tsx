"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpRight, ArrowDownLeft } from "lucide-react"

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
            const type = row.getValue("type") as string
            return (
                <div className="font-medium flex items-center gap-2">
                    {type === 'Zap' ? (
                        <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                    ) : (
                        <ArrowDownLeft className="h-4 w-4 text-blue-500" />
                    )}
                    {type}
                </div>
            )
        },
    },
    {
        accessorKey: "asset",
        header: "Asset",
        cell: ({ row }) => {
            return <div className="text-zinc-300">{row.getValue("asset")}</div>
        }
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            return (
                <div className={`text-xs px-2 py-1 rounded-full inline-block ${status === 'Success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800 text-zinc-400'
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

            return <div className="text-right font-mono text-emerald-400 font-bold">+{formatted}</div>
        },
    },
    {
        accessorKey: "txHash",
        header: "Transaction Hash",
        cell: ({ row }) => {
            const txHash = row.getValue("txHash") as string
            return <div className="text-zinc-300 font-mono text-xs">{txHash}</div>
        }
    }
]
