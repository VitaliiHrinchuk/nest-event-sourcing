// import {Inject, Type} from "@nestjs/common";
// import {EventDispatcher} from "../event-dispatcher";
// import {Projector} from "../projector";
// import {DomainEvent} from "../../event-store/event";
// import {EventHandler} from "../interfaces";
//
// export function ProjectorHandler(event: Type<DomainEvent>) {
//     const injectDispatcher = Inject(EventDispatcher);
//
//     return <T extends Projector>(target: new () => T): new () => T => {
//         injectDispatcher(target, 'dispatcher');
//
//         const dispatcher: EventDispatcher = this.dispatcher;
//         dispatcher.listen(event.name, new target);
//
//         return target;
//     }
// }
