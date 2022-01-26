import {DomainEvent} from "../../event-store/event";
import {EventHandler} from "./event-handler.interface";

export interface Dispatcher {
    dispatch(event: DomainEvent): void;

    listen(name: string, handler: EventHandler): void;


}
