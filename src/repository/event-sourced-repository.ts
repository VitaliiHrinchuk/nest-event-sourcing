import {Repository} from "./interfaces";
import {AggregateRoot} from "./aggregate-root";
import {EventStore} from "../event-store";
import {EventDispatcher} from "../dispatcher";
import {DomainEvent} from "../event-store/event";
import {Injectable} from "@nestjs/common";

@Injectable()
export class EventSourcedRepository implements Repository {

    /**
     * Event Store
     * @protected
     */
    protected store: EventStore;

    /**
     * Event Dispatcher
     * @protected
     */
    protected dispatcher: EventDispatcher;

    constructor(store: EventStore, dispatcher: EventDispatcher) {
        this.store = store;
        this.dispatcher = dispatcher;
    }

    /**
     * Commit and dispatch recorded events
     * @param aggregate AggregateRoot
     */
    public async save(aggregate: AggregateRoot): Promise<void> {
        const recordedEvents: DomainEvent[] = aggregate.getRecordedEvents();
        console.log('============ Commit events')
        await this.commitEvents(recordedEvents);
        console.log('============ dispatch events')

        await this.dispatchEvents(recordedEvents);
        console.log('============ dispatched events!')

    }

    /**
     * Commit a list of events
     * @param events Events list
     * @private
     */
    private async commitEvents(events: DomainEvent[]): Promise<void> {
        await this.store.commitAll(events);
    }

    /**
     * Dispatch a list of events
     * @param events Events list
     * @private
     */
    private async dispatchEvents(events: DomainEvent[]): Promise<void> {

        const dispatchingEvents = events.map(event => this.dispatcher.dispatch(event));

        await Promise.all(dispatchingEvents);
    }
}
