import {DynamicModule, Module, Provider} from "@nestjs/common";
import {EventSourcingAsyncOptions, EventSourcingOptions, EventSourcingOptionsFactory} from "./interfaces";
import {EventDispatcher} from "../dispatcher";
import {EventStore} from "../event-store";
import {EventSourcedRepository} from "../repository";
import {HandlersMapNode} from "./interfaces";
import {EVENT_DISPATCHER_HANDLERS, EVENT_SOURCING_OPTIONS} from "./event-sourcing.constants";
import {EventSourcingCoreModule} from "./event-sourcing-core.module";

@Module({})
export class EventSourcingModule {
    static forRoot(options: EventSourcingOptions): DynamicModule {
        return {
            module: EventSourcingModule,
            imports: [EventSourcingCoreModule.forRoot(options)],
        };
    }

    static forRootAsync(options: EventSourcingAsyncOptions): DynamicModule {

        return {
            module: EventSourcingModule,
            imports: [EventSourcingCoreModule.forRootAsync(options)],
        };
    }

    // static forFeature(handlers: HandlersMapNode[]): DynamicModule {
    //     console.log('call1')
    //     return {
    //         module: EventSourcingModule,
    //         providers: [
    //             {
    //                 provide: EVENT_DISPATCHER_HANDLERS +Math.random(),
    //                 useFactory: async (dispatcher: EventDispatcher) => {
    //                     console.log('cire', dispatcher)
    //                     handlers.forEach(handler => {
    //                         console.log('register handler',handler.event.name )
    //                         dispatcher.listen(handler.event.name, handler.handler)
    //                     });
    //                 },
    //                 inject: [EventDispatcher]
    //             },
    //         ],
    //     }
    // }
    static forFeature(handlers: HandlersMapNode[]): DynamicModule {

        return {
            module: EventSourcingModule,
            // providers: [
            //     {
            //         provide: EVENT_DISPATCHER_HANDLERS + Math.random(),
            //         useFactory: async (dispatcher: EventDispatcher) => {
            //             handlers.forEach(handler => {
            //                 console.log('register handler',handler.event.name )
            //                 dispatcher.listen(handler.event.name, handler.handler)
            //             });
            //         },
            //         inject: [EventDispatcher]
            //     },
            // ],
            providers: handlers.map(handler => ({
                    provide: handler.event.name + handler.handler.name,
                    useFactory: async (dispatcher: EventDispatcher) => {
                        await dispatcher.listen(handler.event.name, handler.handler)
                    },
                    inject: [EventDispatcher]
                }
            ))
        }
    }
}
