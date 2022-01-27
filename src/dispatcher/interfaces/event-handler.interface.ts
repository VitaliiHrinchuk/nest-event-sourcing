import {DomainEvent} from "../../event-store/event";

export interface EventHandler {
    /**
     * Event's handle logic
     * @param event
     */
    handle(event: DomainEvent): void;
}
