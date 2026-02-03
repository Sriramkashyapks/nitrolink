import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
    // The Wallet Address (e.g. 0x123...)
    @Prop({ required: true, unique: true })
    address: string;

    // The ENS Name (e.g. nick.eth)
    @Prop()
    ensName: string;

    // We track how much money they received for the Leaderboard
    @Prop({ default: 0 })
    totalReceived: number;
}

export const UserSchema = SchemaFactory.createForClass(User);