import {EventHandler} from "./interfaces";
import {DomainEvent} from "../event-store/event";

export class Projector implements EventHandler {
    handle(event: DomainEvent): void {
        console.log('base handle')
    }
}
