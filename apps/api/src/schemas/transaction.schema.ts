import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Transaction extends Document {
    @Prop({ required: true })
    userAddress: string;

    @Prop({ required: true })
    type: string; // "Zap"

    @Prop({ required: true })
    asset: string; // "USDC"

    @Prop({ required: true })
    amount: string;

    @Prop({ required: true })
    txHash: string;

    @Prop({ default: 'Success' })
    status: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);