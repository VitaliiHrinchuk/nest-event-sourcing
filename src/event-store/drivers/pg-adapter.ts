import {DomainEvent} from "../event";
import {EventParameters, EventStore} from "../interfaces";
import {Client, ClientConfig, QueryConfig, QueryResult, QueryResultRow} from "pg";
import {EventNotFoundException} from "../exceptions";
import format = require("pg-format");


export class PgAdapter implements EventStore {

    private client: Client;

    constructor(config: ClientConfig) {
        this.client = new Client(config);
    }

    public async commit(event: DomainEvent): Promise<void> {
        const query: QueryConfig = {
            text: `INSERT INTO event_streams
                    (id, name, version, aggregate_id, aggregate_type, aggregate_version, payload, metadata, created_at)
                   VALUES 
                    ($1, $2, $3, $4, $5, $6, $7, $8, now())`,
            values: [
                event.id,
                event.name,
                event.version,
                event.aggregateId,
                event.aggregateType,
                event.aggregateVersion,
                event.payload,
                event.metadata
            ]
        };

        await this.client.query(query);
    }

    public async load(aggregateId: string, version?: number): Promise<EventParameters> {
        const query: QueryConfig = {
            text: `SELECT * FROM event_streams
                   WHERE aggregate_id = $1 AND aggregate_version <= $2,
                   ORDER_BY created_at ASC`,
            values: [
                aggregateId,
                version
            ]
        };
        const result: QueryResult = await this.client.query(query);

        if(result.rows.length == 0) {
            throw new EventNotFoundException(`No events found with id ${aggregateId}`);
        }

        const row: QueryResultRow = result.rows[0];

        return this.queryResultRowToEventParameters(row);
    }

    public async loadAll(): Promise<Array<EventParameters>> {
        const query: QueryConfig = {
            text: `SELECT * FROM event_streams
                   WHERE aggregate_id IS NOT NULL
                   ORDER BY created_at ASC`,
        };
        const result: QueryResult = await this.client.query(query);

        const events = result.rows.map(row => this.queryResultRowToEventParameters(row));

        return events;
    }

    async commitAll(events: DomainEvent[]): Promise<void> {
        const query: string = format(
            `INSERT INTO event_streams
              (id, name, version, aggregate_id, aggregate_type, aggregate_version, payload, metadata, created_at)
             VALUES %L`,
            events.map(event => [
                event.id,
                event.name,
                event.version,
                event.aggregateId,
                event.aggregateType,
                event.aggregateVersion,
                event.payload,
                event.metadata,
                Date.now()
            ]));

        await this.client.query(query);
    }

    public async init(): Promise<void> {
        try {
            await this.client.connect();
            const tableExists = await this.checkTableExists();
            console.log('client', tableExists)
            if (!tableExists) {
                await this.createTable();
            }
        } catch (error) {
            throw error;
        }
    }

    public close(): Promise<void> {
        return this.client.end();
    }


    private async checkTableExists(): Promise<boolean> {
        const res = await this.client.query(
            `SELECT EXISTS (
                    SELECT FROM 
                        pg_tables
                    WHERE 
                        schemaname = 'public' AND 
                        tablename  = 'event_streams'
                );`
        );

        return res.rows[0].exists;
    }

    private createTable(): Promise<QueryResult<any>> {
        const query = `
            CREATE TABLE IF NOT EXISTS event_streams (
                id UUID NOT NULL,
                name VARCHAR(255) NOT NULL,
                version INTEGER DEFAULT 0 NOT NULL,
                aggregate_id UUID NOT NULL, 
                aggregate_type VARCHAR(255) NOT NULL, 
                aggregate_version INTEGER DEFAULT 0 NOT NULL,
                payload JSONB,
                metadata JSONB,
                created_at TIMESTAMP DEFAULT now() NOT NULL,
                PRIMARY KEY (id)
            )
        `;

        return this.client.query(query);
    }

    private queryResultRowToEventParameters(row: QueryResultRow): EventParameters {
        return {
            id: row.id,
            name: row.name,
            aggregateId: row.aggregate_id,
            aggregateType: row.aggregate_type,
            aggregateVersion: row.aggregate_version,
            version: row.version,
            metadata: row.metadata,
            payload: row.payload
        };
    }
}
