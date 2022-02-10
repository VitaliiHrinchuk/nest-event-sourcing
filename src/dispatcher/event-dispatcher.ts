import {DomainEvent} from "../event-store/event";
import {EventHandler} from "./interfaces/event-handler.interface";
import {Global, Injectable, OnModuleInit, Type} from "@nestjs/common";
import {Dispatcher} from "./interfaces";
import {Projector} from "./projector";
import {Reactor} from "./reactor";
import {ModuleRef} from "@nestjs/core";

@Injectable()
export class EventDispatcher implements Dispatcher{

    /**
     * Map of event handlers
     * @private
     */
    //private listeners: Map<string, EventHandler>;
    private listeners: Map<string, Type<EventHandler>[]>;

    private moduleRef: ModuleRef;

    constructor(moduleRef: ModuleRef) {
        this.listeners = new Map<string, Type<EventHandler>[]>();
        this.moduleRef = moduleRef;
    }

    /**
     * Dispatch a single event
     * @param event
     */
    public async dispatch(event: DomainEvent): Promise<void> {
        const handlers: EventHandler[] | null = this.getHandlers(event);

        if (handlers) {
            try {
                const promises: Promise<void>[] = [];
                handlers.forEach(handler => {
                  promises.push(this.handleEvent(event, handler));
                })
                await Promise.all(promises);
            } catch (error) {
                throw error;
            }
        }
    }

    /**
     * Register an event listener with the dispatcher.
     * @param name event name
     * @param handler event handler
     */
    public async listen(name: string, handler: Type<EventHandler>): Promise<void> {
        if (!this.listeners.has(name)) {
            this.listeners.set(name, [handler]);
        } else {
            const handlers: Type<EventHandler>[] = this.listeners.get(name);
            handlers.push(handler);
            this.listeners.set(name, handlers);
        }
        console.log(name,this.listeners.get(name))
    }

    /**
     * Get the event's name.
     * @param event Event
     * @private
     */
    private getEventName(event: DomainEvent) {
        if (event.name) {
            return event.name;
        } else {
            return event.constructor.name;
        }
    }

    /**
     * Get event's handler
     * @param event Event
     * @private
     */
    private getHandlers(event: DomainEvent): EventHandler[] | null {
        const name: string = this.getEventName(event);

        if (this.listeners.has(name)) {
            const eventHandlerTypes = this.listeners.get(name);
            return eventHandlerTypes.map(eventHandlerType => this.createCallableListener(eventHandlerType));
        } else {
            console.warn('No handler specified for the event: ' + name);
            return null;
        }
    }

    /**
     * Dispatch projectors only.
     * @param event Event
     * @private
     */
    public async replay(event: DomainEvent): Promise<void> {
        const handlers: EventHandler[] | null = this.getHandlers(event);

        if (handlers){
            const promises: Promise<void>[] = [];
            handlers.forEach(handler => {
                if(handler instanceof Projector) {
                    promises.push(this.handleEvent(event, handler));
                }
            })
            await Promise.all(promises);
        }
    }

    /**
     * Create a class based listener using the IoC container.
     * @param string $listener
     * @return object
     * @throws BindingResolutionException
     */
    private createCallableListener(handlerType: Type<EventHandler>): EventHandler {
        return this.moduleRef.get(handlerType, {strict: false});
    }

    private getListenerActionName(eventName: string): string {
        return `apply${eventName}`;
    }

    private getListenerAction(eventName: string, handler: EventHandler): string {
        const listenerActionName = this.getListenerActionName(eventName);

        if (handler[listenerActionName]) {
            return listenerActionName;
        } else {
            return 'handle';
        }
    }

    private async handleEvent(event: DomainEvent, handler: EventHandler): Promise<void> {
        const eventName: string = event.name;
        const actionName: string = this.getListenerAction(eventName, handler);

        try {
            await handler[actionName](event);
        } catch (e) {
            throw e;
        }
    }
}
