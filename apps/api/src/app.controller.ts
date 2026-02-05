import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { Transaction } from './schemas/transaction.schema';
import { EventsService } from './events/events.service';

@Controller()
export class AppController {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Transaction.name) private txModel: Model<Transaction>,
    private eventsService: EventsService,
  ) { }

  // 1. Login User
  @Post('login')
  async login(@Body() body: { address: string; ensName: string }) {
    return this.userModel.findOneAndUpdate(
      { address: body.address },
      { $setOnInsert: { address: body.address, ensName: body.ensName } },
      { upsert: true, new: true }
    );
  }

  // 2. Save Transaction (Call this after Zap)
  @Post('transaction')
  async createTransaction(@Body() body: any) {
    return this.txModel.create(body);
  }

  // 3. Get History (Call this for the Table)
  @Get('transactions')
  async getTransactions(@Query('address') address: string) {
    return this.txModel.find({ userAddress: address }).sort({ createdAt: -1 });
  }

  // 4. Leaderboard
  @Get('leaderboard')
  async getLeaderboard() {
    return this.userModel.find().sort({ totalReceived: -1 }).limit(10);
  }

  // 5. Get Active Stream Details
  @Get('stream')
  async getStream(@Query('address') address?: string) {
    if (address) {
      const stream = this.eventsService.getStreamBySender(address);
      return stream || { status: 'no_active_stream' };
    }
    return this.eventsService.getAllStreams();
  }
}