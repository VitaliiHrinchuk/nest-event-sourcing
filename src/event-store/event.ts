import { IEvent } from '@nestjs/cqrs/dist/interfaces';
import { v4 as uuidv4 } from 'uuid';

export abstract class DomainEvent implements IEvent {
    id: string;
    name: string;
    aggregateId: string;
    aggregateType: string;
    aggregateVersion: number = 1;
    version: number = 1;
    payload?: object;
    metadata?: object;

    constructor(id?: string) {
        this.name = this.constructor.name;
        if (!id) {
            this.id = uuidv4();
        } else {
            this.id = id;
        }
    }
}
