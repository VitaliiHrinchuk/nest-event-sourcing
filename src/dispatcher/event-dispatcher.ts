import {DomainEvent} from "../event-store/event";
import {EventHandler} from "./interfaces/event-handler.interface";
import {Global, Injectable, Type} from "@nestjs/common";
import {Dispatcher} from "./interfaces";
import {Projector} from "./projector";
import {Reactor} from "./reactor";
import {ModuleRef} from "@nestjs/core";

@Injectable()
export class EventDispatcher implements Dispatcher {

    /**
     * Map of event handlers
     * @private
     */
    private listeners: Map<string, EventHandler>;

    private moduleRef: ModuleRef;

    constructor(moduleRef: ModuleRef) {
        this.listeners = new Map<string, EventHandler>();
        this.moduleRef = moduleRef;
    }

    /**
     * Dispatch a single event
     * @param event
     */
    public async dispatch(event: DomainEvent): Promise<void> {
        const handler: EventHandler | null = this.getHandler(event);

        if (handler) {
            try {
                await this.handleEvent(event, handler);
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
            const eventHandler: EventHandler = await this.createCallableListener(handler);
            this.listeners.set(name, eventHandler);
        }
    }

    /**
     * Get the event's name.
     * @param event Event
     * @private
     */
    private getEventName(event: DomainEvent) {
        return event.constructor.name;
    }

    /**
     * Get event's handler
     * @param event Event
     * @private
     */
    private getHandler(event: DomainEvent): EventHandler | null {
        const name: string = this.getEventName(event);

        if (this.listeners.has(name)) {
            return this.listeners.get(name);
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
    private async replay(event: DomainEvent): Promise<void> {
        const handler: EventHandler | null = this.getHandler(event);

        if (handler && handler instanceof Projector) {
            try {
                await this.handleEvent(event, handler);
            } catch (error) {
                throw error;
            }
        }
    }

    /**
     * Create a class based listener using the IoC container.
     * @param string $listener
     * @return object
     * @throws BindingResolutionException
     */
    private createCallableListener(handlerType: Type<EventHandler>): Promise<EventHandler> {
        return this.moduleRef.create<EventHandler>(handlerType);
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
