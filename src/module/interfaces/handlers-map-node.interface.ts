import { DomainEvent } from "../../event-store";
import {EventHandler} from "../../dispatcher/interfaces";
import {Projector, Reactor} from "../../dispatcher";
import {Type} from "@nestjs/common";

export interface HandlersMapNode {
    event: Type<DomainEvent>,
    handler: Type<EventHandler>
}

