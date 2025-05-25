import { Int, ConsumerFunction, Message } from "../types";

export default class Consumer {

    public fn: ConsumerFunction;

    public synchronous: boolean;

    public currentIndex: Int;

    public running: boolean;

    public backlog: Message[];

    private static readonly MAX_BACKLOG_SIZE = 100; // Maximum number of messages in backlog

    constructor (fn: ConsumerFunction, synchronous: boolean, currentIndex: Int) {
        this.fn = fn;
        this.synchronous = synchronous;
        this.currentIndex = currentIndex;
        this.running = false;
        this.backlog = [];
    }

    publish (message: Message) {
        this.backlog.push (message);
        if (this.backlog.length > Consumer.MAX_BACKLOG_SIZE) {
            console.warn (`WebSocket consumer backlog is too large (${this.backlog.length} messages). This might indicate a performance issue or message processing bottleneck.`);
        }
        this._run ();
    }

    async _run () {
        if (this.running) {
            return;
        }
        this.running = true;
        while (this.backlog.length > 0) {
            const message = this.backlog.shift ();
            await this._handleMessage (message);
        }
        this.running = false;
    }

    async _handleMessage (message: Message) {
        if (message.metadata.index <= this.currentIndex) {
            return;
        }
        this.currentIndex = message.metadata.index;
        if (this.synchronous) {
            await this.fn (message);
        }
        else {
            this.fn (message);
        }
    }

}

export {
    Consumer
}
