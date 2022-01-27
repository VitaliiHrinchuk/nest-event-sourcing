import {DomainEvent} from "../event-store";
import { v4 as uuidv4 } from 'uuid';

export abstract class AggregateRoot {
    /**
     * Aggregate Id (UUID 4)
     * @protected
     */
    protected id: string;

    /**
     * Aggregate Version
     * @protected
     */
    protected version: number = 1;

    /**
     * Array of recorded events
     * @protected
     */
    protected recordedEvents: DomainEvent[];

    constructor(id?: string) {
        this.recordedEvents = [];

        if(id) {
            this.id = id;
        } else {
            this.id = uuidv4();
        }
    }

    /**
     * @return events recorded events
     */
    public getRecordedEvents(): DomainEvent[] {
        return this.recordedEvents;
    }

    /**
     * Record single event
     * @param event Event
     */
    public record(event: DomainEvent) {
        event.aggregateId = this.id;
        event.aggregateVersion = this.version;
        event.aggregateType = this.constructor.name;

        this.recordedEvents.push(event);
    }

    /**
     * @return id aggregate id
     */
    public getId(): string {
        return this.id;
    }

    /**
     * Set aggregate id
     * @param id uuid
     */
    public setId(id: string): void {
        this.id = id;
    }
}
