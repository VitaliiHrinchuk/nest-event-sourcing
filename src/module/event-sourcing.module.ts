import {DynamicModule, Module, Provider} from "@nestjs/common";
import {EventSourcingAsyncOptions, EventSourcingOptions, EventSourcingOptionsFactory} from "./interfaces";
import {EventDispatcher} from "../dispatcher";
import {EventStore} from "../event-store";
import {EventSourcedRepository} from "../repository";
import {HandlersMapNode} from "./interfaces";
import {EVENT_DISPATCHER_HANDLERS, EVENT_SOURCING_OPTIONS} from "./event-sourcing.constants";

@Module({})
export class EventSourcingModule {
    static forRoot(options: EventSourcingOptions): DynamicModule {
        const eventStore: EventStore = options.driver;
        return {
            module: EventSourcingModule,
            providers: [
                {
                    provide: EventDispatcher,
                    useValue: new EventDispatcher(),
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
                    useFactory: (dispatcher: EventDispatcher, eventStore: EventStore) => {
                        return new EventSourcedRepository(eventStore, dispatcher)
                    },
                    inject: [EventDispatcher, 'EventStore']
                }
            ],
            exports: [EventSourcedRepository, EventDispatcher],
            global: true,
        };
    }

    static forRootAsync(options: EventSourcingAsyncOptions): DynamicModule {

        return {
            module: EventSourcingModule,
            imports: options.imports || [],
            providers: [
                ...this.createAsyncProviders(options),
                {
                    provide: EventDispatcher,
                    useValue: new EventDispatcher(),
                },
                {
                    provide: 'EventStore',
                    useFactory: async (options: EventSourcingOptions) => {
                        const eventStore: EventStore = options.driver;
                        await eventStore.init();
                        return eventStore;
                    },
                    inject: [EVENT_SOURCING_OPTIONS]
                },
                {
                    provide: EventSourcedRepository,
                    useFactory: (dispatcher: EventDispatcher, eventStore: EventStore) => {
                        return new EventSourcedRepository(eventStore, dispatcher)
                    },
                    inject: [EventDispatcher, 'EventStore']
                }
            ],
            exports: [EventSourcedRepository, EventDispatcher],
            global: true
        };
    }

    private static createAsyncProviders(options: EventSourcingAsyncOptions): Provider[] {
        if (options.useExisting || options.useFactory) {
            return [this.createAsyncOptionsProvider(options)];
        }
        return [
            this.createAsyncOptionsProvider(options),
            {
                provide: options.useClass,
                useClass: options.useClass
            }
        ];
    }

    private static createAsyncOptionsProvider(options: EventSourcingAsyncOptions): Provider {
        if (options.useFactory) {
            return {
                provide: EVENT_SOURCING_OPTIONS,
                useFactory: options.useFactory,
                inject: options.inject || []
            };
        }
        return {
            provide: EVENT_SOURCING_OPTIONS,
            useFactory: async (optionsFactory: EventSourcingOptionsFactory) => await optionsFactory.createOptions(),
            inject: [options.useExisting || options.useClass]
        };
    }


    static forFeature(handlers: HandlersMapNode[]): DynamicModule {

        return {
            module: EventSourcingModule,
            providers: [
                {
                    provide: EVENT_DISPATCHER_HANDLERS,
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
