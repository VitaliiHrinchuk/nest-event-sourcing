import {DomainEvent} from "../../event-store/event";

export interface EventHandler {
    handle(event: DomainEvent): void;
}
