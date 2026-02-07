import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Transaction } from './schemas/transaction.schema';
import { EventsService } from './events/events.service';

describe('AppController', () => {
  let appController: AppController;

  // Mock implementations
  const mockUserModel = {
    findOneAndUpdate: jest.fn(),
    find: jest.fn(),
  };

  const mockTransactionModel = {
    create: jest.fn(),
    find: jest.fn(() => ({
      sort: jest.fn(() => ({
        limit: jest.fn(() => ({
          skip: jest.fn(),
        })),
      })),
    })),
    countDocuments: jest.fn(),
  };

  const mockEventsService = {
    getStreamBySender: jest.fn(),
    getAllStreams: jest.fn(),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: getModelToken(Transaction.name),
          useValue: mockTransactionModel,
        },
        {
          provide: EventsService,
          useValue: mockEventsService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  it('should be defined', () => {
    expect(appController).toBeDefined();
  });

  describe('login', () => {
    it('should create or update a user', async () => {
      const mockUser = { address: '0x123', ensName: 'test.eth' };
      mockUserModel.findOneAndUpdate.mockResolvedValue(mockUser);

      const result = await appController.login(mockUser);
      expect(result).toEqual(mockUser);
      expect(mockUserModel.findOneAndUpdate).toHaveBeenCalled();
    });
  });

  describe('getLeaderboard', () => {
    it('should return top 10 users', async () => {
      const mockLeaderboard = [{ address: '0x123', totalReceived: 100 }];
      mockUserModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue(mockLeaderboard),
        }),
      });

      const result = await appController.getLeaderboard();
      expect(result).toEqual(mockLeaderboard);
    });
  });
});
