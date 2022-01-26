import {AggregateRoot} from "../aggregate-root";

export interface Repository {
    save(aggregate: AggregateRoot): Promise<void>
}
