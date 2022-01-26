import {DomainEvent} from "../event";
import {EventParameters} from "./event-parameters.interface";

export interface EventStore {
    commit(events: DomainEvent): Promise<void>;

    commitAll(events: DomainEvent[]): Promise<void>;

    load(aggregateId: string, version?: number): Promise<EventParameters>;

    loadAll(): Promise<Array<EventParameters>>;

    init(): Promise<void>
}
