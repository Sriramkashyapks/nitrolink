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
    const result = await this.txModel.create(body);
    return result;
  }

  // TEST ENDPOINT - Create a test transaction with recipientAddress
  @Post('transaction/test')
  async createTestTransaction() {
    const testData = {
      userAddress: '0x1234567890123456789012345678901234567890',
      recipientAddress: '0x0987654321098765432109876543210987654321',
      type: 'Test Zap',
      asset: 'ETH',
      amount: '0.01',
      txHash: '0xtest' + Date.now(),
      status: 'Success'
    };
    const result = await this.txModel.create(testData);
    return result;
  }

  // 3. Get History (Call this for the Table)
  @Get('transactions')
  async getTransactions(
    @Query('address') address: string,
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 5;
    const skipNum = skip ? parseInt(skip, 10) : 0;

    const [transactions, total] = await Promise.all([
      this.txModel.find({ userAddress: address })
        .sort({ createdAt: -1 })
        .limit(limitNum)
        .skip(skipNum),
      this.txModel.countDocuments({ userAddress: address })
    ]);

    return {
      transactions,
      total,
      hasMore: skipNum + limitNum < total
    };
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