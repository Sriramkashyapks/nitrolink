import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Transaction extends Document {
    @Prop({ required: true })
    userAddress: string;

    @Prop()
    recipientAddress?: string; // Recipient of the transaction (optional for backward compatibility)

    @Prop({ required: true })
    type: string; // "Zap" or "Stream Settlement"

    @Prop({ required: true })
    asset: string; // "USDC", "ETH", etc.

    @Prop({ required: true })
    amount: string;

    @Prop({ required: true })
    txHash: string;

    @Prop({ default: 'Success' })
    status: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);