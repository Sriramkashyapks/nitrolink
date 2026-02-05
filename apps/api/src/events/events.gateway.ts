import {
    ConnectedSocket,
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface StreamSession {
    recipient: string;
    rate: number; // USDC per second
    balance: number;
    intervalId: any;
    startTime: number;
}

@WebSocketGateway({
    cors: {
        origin: '*', // Allow connections from your frontend
    },
})
export class EventsGateway {
    @WebSocketServer()
    server: Server;

    // In-memory "State Channel" storage
    // In production, this would be a Redis DB
    private activeStreams = new Map<string, StreamSession>();

    @SubscribeMessage('start_stream')
    handleStartStream(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { recipient: string; rate: number },
    ) {
        const clientId = client.id;

        // 1. Check if stream already exists
        if (this.activeStreams.has(clientId)) {
            return { status: 'error', message: 'Stream already active' };
        }

        console.log(`⚡ Opening Yellow State Channel for ${clientId} -> ${data.recipient}`);

        // 2. Create the Session
        const session: StreamSession = {
            recipient: data.recipient,
            rate: data.rate || 0.0001, // Default rate if none provided
            balance: 0,
            startTime: Date.now(),
            intervalId: null,
        };

        // 3. Start the High-Frequency Ticker (The "Stream")
        // This simulates the off-chain state updates
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
        this.activeStreams.set(clientId, session);

        return { status: 'success', message: 'Channel Opened' };
    }

    @SubscribeMessage('stop_stream')
    handleStopStream(@ConnectedSocket() client: Socket) {
        const clientId = client.id;
        const session = this.activeStreams.get(clientId);

        if (!session) {
            return { status: 'error', message: 'No active stream found' };
        }

        console.log(`🛑 Closing Channel. Final Balance: ${session.balance}`);

        // 1. Stop the Timer
        clearInterval(session.intervalId);

        // 2. Capture Final State
        const finalBalance = session.balance;

        // 3. Destroy Session
        this.activeStreams.delete(clientId);

        // 4. Return Final State for Settlement
        return {
            status: 'settled',
            finalBalance: finalBalance,
            recipient: session.recipient
        };
    }

    // Cleanup if user disconnects abruptly
    handleDisconnect(client: Socket) {
        if (this.activeStreams.has(client.id)) {
            const session = this.activeStreams.get(client.id);
            clearInterval(session?.intervalId);
            this.activeStreams.delete(client.id);
            console.log(`Client ${client.id} disconnected. Stream killed.`);
        }
    }
}