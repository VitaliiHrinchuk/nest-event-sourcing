export class EventNotFoundException extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'EventNotFoundException'
    }
}