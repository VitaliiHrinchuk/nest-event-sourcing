import { IEvent } from '@nestjs/cqrs/dist/interfaces';
import { v4 as uuidv4 } from 'uuid';

export abstract class DomainEvent implements IEvent {

    /**
     * UUID 4
     */
    id: string;

    /**
     * Event name
     */
    name: string;

    /**
     * Aggregate Id (UUID 4)
     */
    aggregateId: string;

    /**
     * Class of aggregate root.
     */
    aggregateType: string;

    /**
     * Aggregate version.
     */
    aggregateVersion: number = 1;

    /**
     *  Event versioning.
     */
    version: number = 1;

    /**
     * Event payload
     */
    payload?: any;

    /**
     * Event meta
     */
    metadata?: any;

    constructor(id?: string) {
        this.name = this.constructor.name;
        if (!id) {
            this.id = uuidv4();
        } else {
            this.id = id;
        }
    }
}
