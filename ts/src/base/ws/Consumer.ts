import { ConsumerFunctionError } from "../errors.js";
import { Int, ConsumerFunction, Message } from "../types";
import FastQueue from "./FastQueue.js";

export default class Consumer {

    public fn: ConsumerFunction;

    public synchronous: boolean;

    public currentIndex: Int;

    public running: boolean;

    public backlog: FastQueue<Message>;

    private static readonly MAX_BACKLOG_SIZE = 10; // Maximum number of messages in backlog

    constructor (fn: ConsumerFunction, synchronous: boolean, currentIndex: Int) {
        this.fn = fn;
        this.synchronous = synchronous;
        this.currentIndex = currentIndex;
        this.running = false;
        this.backlog = new FastQueue<Message> ();
    }

    publish (message: Message) {
        this.backlog.enqueue (message);
        if (this.backlog.getLength () > Consumer.MAX_BACKLOG_SIZE) {
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
    Consumer
}
