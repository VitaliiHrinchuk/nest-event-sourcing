import {DomainEvent} from "../event";
import {EventParameters} from "./event-parameters.interface";

export interface EventStore {

    /**
     * Commit single event to the store
     * @param events Event
     */
    commit(events: DomainEvent): Promise<void>;

    /**
     * Commit a list of event to the store
     * @param events
     */
    commitAll(events: DomainEvent[]): Promise<void>;

    /**
     * Load event from the store
     * @param aggregateId Aggregate id
     * @param version event version
     */
    load(aggregateId: string, version?: number): Promise<EventParameters>;

    /**
     * Load events from the store
     * @param aggregateId Aggregate id
     * @param version event version
     */
    loadAll(): Promise<Array<EventParameters>>;

    /**
     * Initialize a store
     */
    init(): Promise<void>
}
