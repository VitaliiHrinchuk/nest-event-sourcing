import {DynamicModule, Module} from "@nestjs/common";
import {EventSourcingOptions} from "./interfaces";
import {EventDispatcher} from "../dispatcher";
import {EventStore} from "../event-store";
import {EventSourcedRepository} from "../repository";
import {HandlersMapNode} from "./interfaces";

@Module({})
export class EventSourcingModule {
    static forRoot(options: EventSourcingOptions): DynamicModule {
        const dispatcher = new EventDispatcher();
        const eventStore: EventStore = options.driver;
        const repository = new EventSourcedRepository(eventStore, dispatcher);
        return {
            module: EventSourcingModule,
            providers: [
                {
                    provide: EventDispatcher,
                    useValue: dispatcher,
                },
                {
                    provide: 'EventStore',
                    useFactory: async () => {
                        await eventStore.init();
                        return eventStore;
                    }
                },
                {
                    provide: EventSourcedRepository,
                    useValue: repository
                }
            ],
            exports: [EventSourcedRepository, EventDispatcher],
            global: true,
        };
    }

    static forFeature(handlers: HandlersMapNode[]): DynamicModule {

        return {
            module: EventSourcingModule,
            providers: [
                {
                    provide: "EVENT_DISPATCHER_HANDLERS",
                    useFactory: (dispatcher: EventDispatcher) => {
                        handlers.forEach(handler => {
                            dispatcher.listen(handler.event.name, handler.handler);
                        })
                    },
                    inject: [EventDispatcher]
                }
            ]
        }
    }
}
