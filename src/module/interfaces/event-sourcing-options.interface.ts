import {EventStore} from "../../event-store";
import {ModuleMetadata, Type} from "@nestjs/common";

export interface EventSourcingOptions {
    driver: EventStore
}

export interface EventSourcingAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
    useExisting?: Type<EventSourcingOptions>;
    useClass?: Type<EventSourcingOptions>;
    useFactory?: (...args: any[]) => Promise<EventSourcingOptions> | EventSourcingOptions;
    inject?: any[];
}


export interface EventSourcingOptionsFactory {
    createOptions(): Promise<EventSourcingOptions> | EventSourcingOptions;
}
