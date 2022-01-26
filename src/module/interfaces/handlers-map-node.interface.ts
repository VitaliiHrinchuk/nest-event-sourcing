import { DomainEvent } from "src/event-store";
import {EventHandler} from "../../dispatcher/interfaces";

export interface HandlersMapNode {
    event: typeof DomainEvent,
    handler: EventHandler
}

