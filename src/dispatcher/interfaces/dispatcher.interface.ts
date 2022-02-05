import {DomainEvent} from "../../event-store/event";
import {EventHandler} from "./event-handler.interface";
import {Type} from "@nestjs/common";

export interface Dispatcher {
    /**
     * Dispatch a single event
     * @param event
     */
    dispatch(event: DomainEvent): Promise<void>;

    /**
     * Register an event listener with the dispatcher.
     * @param name event name
     * @param handler event handler
     */
    listen(name: string, handler: Type<EventHandler>): void;
}
