import {DomainEvent} from "../../event-store/event";
import {EventHandler} from "./event-handler.interface";

export interface Dispatcher {
    /**
     * Dispatch a single event
     * @param event
     */
    dispatch(event: DomainEvent): void;

    /**
     * Register an event listener with the dispatcher.
     * @param name event name
     * @param handler event handler
     */
    listen(name: string, handler: EventHandler): void;
}
