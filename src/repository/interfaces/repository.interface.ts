import {AggregateRoot} from "../aggregate-root";

export interface Repository {
    /**
     * Save and dispatch recorded events
     * @param aggregate AggregateRoot
     */
    save(aggregate: AggregateRoot): Promise<void>
}
