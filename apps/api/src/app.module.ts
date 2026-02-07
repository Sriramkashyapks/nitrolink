import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { User, UserSchema } from './schemas/user.schema';
import { Transaction, TransactionSchema } from './schemas/transaction.schema';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsGateway } from './events/events.gateway';
import { EventsService } from './events/events.service';

@Module({
    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forRoot(process.env.MONGO_URI || ''),
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Transaction.name, schema: TransactionSchema },
        ])
    ],
    controllers: [AppController],
    providers: [AppService, EventsGateway, EventsService],
})
export class AppModule { }