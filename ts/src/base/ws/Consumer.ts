import { ConsumerFunctionError } from "../errors.js";
import { Int, ConsumerFunction, Message } from "../types";
import FastQueue from "./FastQueue.js";

interface ConsumerOptions {
    synchronous?: boolean;
    maxBacklogSize?: number;
}

export default class Consumer {

    public fn: ConsumerFunction;

    public synchronous: boolean;

    public currentIndex: Int;

    public running: boolean;

    public backlog: FastQueue<Message>;

    public maxBacklogSize: number;

    private static readonly DEFAULT_MAX_BACKLOG_SIZE = 1000; // Default maximum number of messages in backlog

    constructor (fn: ConsumerFunction, currentIndex: Int, options: ConsumerOptions = {}) {
        this.fn = fn;
        this.synchronous = options.synchronous ?? false;
        this.currentIndex = currentIndex;
        this.running = false;
        this.maxBacklogSize = options.maxBacklogSize ?? Consumer.DEFAULT_MAX_BACKLOG_SIZE;
        this.backlog = new FastQueue<Message> ();
    }

    publish (message: Message) {
        this.backlog.enqueue (message);
        if (this.backlog.getLength () > this.maxBacklogSize) {
            console.warn (`WebSocket consumer backlog is too large (${this.backlog.getLength ()} messages). This might indicate a performance issue or message processing bottleneck. Dropping oldest message.`);
            this.backlog.dequeue ();
        }
        this._run ();
    }

    async _run () {
        if (this.running) {
            return;
        }
        this.running = true;
        while (!this.backlog.isEmpty ()) {
            const message = this.backlog.dequeue ();
            if (message) {
                await this._handleMessage (message);
            }
        }
        this.running = false;
    }

    async _handleMessage (message: Message) {
        if (message.metadata.index <= this.currentIndex) {
            return;
        }
        this.currentIndex = message.metadata.index;
        const stream = message.metadata.stream;
        const fn = this.fn;
        const produceError = (err: any) => {
            const error = new ConsumerFunctionError (err instanceof Error ? err.message : String (err));
            stream.produce ('errors', message, error);
        };
        if (this.synchronous) {
            try {
                await fn (message);
            } catch (err) {
                produceError (err);
            }
        }
        else {
            try {
                fn (message);
            } catch (err) {
                produceError (err);
            }
        }
    }

}

export {
    Consumer,
    ConsumerOptions
}
