import {Repository} from "./interfaces";
import {AggregateRoot} from "./aggregate-root";
import {EventStore} from "../event-store";
import {EventDispatcher} from "../dispatcher";
import {DomainEvent} from "../event-store/event";
import {Injectable} from "@nestjs/common";

@Injectable()
export class EventSourcedRepository implements Repository {

    protected store: EventStore;

    protected dispatcher: EventDispatcher;

    constructor(store: EventStore, dispatcher: EventDispatcher) {
        this.store = store;
        this.dispatcher = dispatcher;
    }

    public async save(aggregate: AggregateRoot): Promise<void> {
        const recordedEvents: DomainEvent[] = aggregate.getRecordedEvents();
        console.log('============ Commit events')
        await this.commitEvents(recordedEvents);
        console.log('============ dispatch events')

        await this.dispatchEvents(recordedEvents);
        console.log('============ dispatched events!')

    }

    private async commitEvents(events: DomainEvent[]): Promise<void> {
        await this.store.commitAll(events);
    }

    private async dispatchEvents(events: DomainEvent[]): Promise<void> {

        const dispatchingEvents = events.map(event => this.dispatcher.dispatch(event));

        await Promise.all(dispatchingEvents);
    }
}
