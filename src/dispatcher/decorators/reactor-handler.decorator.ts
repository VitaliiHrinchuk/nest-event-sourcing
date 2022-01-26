// import {Inject, Type} from "@nestjs/common";
// import {EventDispatcher} from "../event-dispatcher";
// import {DomainEvent} from "../../event-store/event";
// import {EventHandler} from "../interfaces";
// import {Reactor} from "../reactor";
//
// export function ReactorHandler(event: Type<DomainEvent>) {
//     const injectDispatcher = Inject(EventDispatcher);
//
//     return <T extends Reactor>(target: new () => T): new () => T => {
//         injectDispatcher(target, 'dispatcher');
//
//         const dispatcher: EventDispatcher = this.dispatcher;
//         dispatcher.listen(event.name, new target);
//
//         return target;
//     }
// }
