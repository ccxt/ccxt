export class FetchBaseError extends Error {
    constructor(message: any, type: any);
    type: any;
    get name(): string;
    get [Symbol.toStringTag](): string;
}
