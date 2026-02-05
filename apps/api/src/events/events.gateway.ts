import {
    ConnectedSocket,
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { EventsService, StreamSession } from './events.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
    cors: {
        origin: '*', // Allow connections from your frontend
    },
})
export class EventsGateway {
    @WebSocketServer()
    server: Server;
    private readonly logger = new Logger(EventsGateway.name);

    constructor(private eventsService: EventsService) { }

    @SubscribeMessage('start_stream')
    handleStartStream(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { recipient: string; rate: number; sender?: string },
    ) {
        const clientId = client.id;

        // 1. Check if stream already exists
        if (this.eventsService.hasStream(clientId)) {
            return { status: 'error', message: 'Stream already active' };
        }

        this.logger.log(`Opening Yellow State Channel for ${clientId} (${data.sender || 'unknown'}) -> ${data.recipient}`);

        // 2. Create the Session
        const session: StreamSession = {
            sender: data.sender,
            recipient: data.recipient,
            rate: data.rate || 0.0001, // Default rate if none provided
            balance: 0,
            startTime: Date.now(),
            intervalId: null,
        };

        // 3. Start the High-Frequency Ticker (The "Stream")
        session.intervalId = setInterval(() => {
            session.balance += session.rate;

            // Emit the new state to the client immediately
            client.emit('balance_update', {
                balance: session.balance,
                rate: session.rate,
                timestamp: Date.now(),
            });
        }, 1000); // Update every second

        // 4. Save Session
        this.eventsService.setStream(clientId, session);

        return { status: 'success', message: 'Channel Opened' };
    }

    @SubscribeMessage('stop_stream')
    handleStopStream(@ConnectedSocket() client: Socket) {
        const clientId = client.id;
        const session = this.eventsService.getStream(clientId);

        if (!session) {
            return { status: 'error', message: 'No active stream found' };
        }

        this.logger.log(`Closing Channel. Final Balance: ${session.balance}`);

        // 1. Stop the Timer
        clearInterval(session.intervalId);

        // 2. Capture Final State
        const finalBalance = session.balance;

        // 3. Destroy Session
        this.eventsService.deleteStream(clientId);

        // 4. Return Final State for Settlement
        return {
            status: 'settled',
            finalBalance: finalBalance,
            recipient: session.recipient
        };
    }

    // Cleanup if user disconnects abruptly
    handleDisconnect(client: Socket) {
        const session = this.eventsService.getStream(client.id);
        if (session) {
            clearInterval(session.intervalId);
            this.eventsService.deleteStream(client.id);
            this.logger.log(`Client ${client.id} disconnected. Stream killed.`);
        }
    }
}