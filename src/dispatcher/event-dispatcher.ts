import {DomainEvent} from "../event-store/event";
import {EventHandler} from "./interfaces/event-handler.interface";
import {Injectable} from "@nestjs/common";
import {Dispatcher} from "./interfaces";
import {Projector} from "./projector";
import {Reactor} from "./reactor";

@Injectable()
export class EventDispatcher implements Dispatcher {

    private listeners: Map<string, EventHandler>;

    constructor() {
        this.listeners = new Map<string, EventHandler>();
    }

    public async dispatch(event: DomainEvent): Promise<void> {
        const handler: EventHandler | null = this.getHandler(event);

        if (handler) {
            try {
                await handler.handle(event);
            } catch (error) {
                throw error;
            }
        }
    }

    public listen(name: string, handler: EventHandler): void {
        if (!this.listeners.has(name)) {
            this.listeners.set(name, handler);
        }
    }

    private getEventName(event: DomainEvent) {
        return event.constructor.name;
    }

    private getHandler(event: DomainEvent): EventHandler | null {
        const name: string = this.getEventName(event);

        if (this.listeners.has(name)) {
            return this.listeners.get(name);
        } else {
            console.warn('No handler specified for the event: ' + name);
            return null;
        }
    }

    private async replay(event: DomainEvent): Promise<void> {
        const handler: EventHandler | null = this.getHandler(event);

        if (handler && handler instanceof Projector) {
            try {
                await handler.handle(event);
            } catch (error) {
                throw error;
            }
        }
    }
}
