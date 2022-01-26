import {DomainEvent} from "../event-store";
import { v4 as uuidv4 } from 'uuid';

export abstract class AggregateRoot {
    protected id: string;

    protected version: number = 1;

    protected recordedEvents: DomainEvent[];

    constructor(id?: string) {
        this.recordedEvents = [];

        if(id) {
            this.id = id;
        } else {
            this.id = uuidv4();
        }
    }

    public getRecordedEvents(): DomainEvent[] {
        return this.recordedEvents;
    }

    public record(event: DomainEvent) {
        event.aggregateId = this.id;
        event.aggregateVersion = this.version;
        event.aggregateType = this.constructor.name;

        this.recordedEvents.push(event);
    }

    public getId(): string {
        return this.id;
    }

    public setId(id: string): void {
        this.id = id;
    }
}
