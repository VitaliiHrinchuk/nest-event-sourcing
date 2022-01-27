import {EventHandler} from "./interfaces";
import {DomainEvent} from "../event-store/event";

export abstract class Reactor implements EventHandler {
    handle(event: DomainEvent): void {}
}
