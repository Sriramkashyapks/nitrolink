import { Injectable } from '@nestjs/common';

export interface StreamSession {
    sender?: string;
    recipient: string;
    rate: number; // USDC per second
    balance: number;
    intervalId: any;
    startTime: number;
}

@Injectable()
export class EventsService {
    // In-memory "State Channel" storage
    private activeStreams = new Map<string, StreamSession>();

    setStream(clientId: string, session: StreamSession) {
        this.activeStreams.set(clientId, session);
    }

    getStream(clientId: string) {
        return this.activeStreams.get(clientId);
    }

    deleteStream(clientId: string) {
        this.activeStreams.delete(clientId);
    }

    hasStream(clientId: string) {
        return this.activeStreams.has(clientId);
    }

    getAllStreams() {
        return Array.from(this.activeStreams.entries()).map(([clientId, session]) => ({
            clientId,
            ...session,
            // Don't include intervalId in the output
            intervalId: undefined,
        }));
    }

    getStreamBySender(sender: string) {
        return this.getAllStreams().find(s => s.sender?.toLowerCase() === sender.toLowerCase());
    }
}
