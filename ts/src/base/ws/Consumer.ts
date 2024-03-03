import { Int, ConsumerFunction, Message, Topic } from "../types";
import { Stream } from "./Stream.js";

export default class Consumer {

    public fn: ConsumerFunction;

    public synchronous: boolean;

    public currentIndex: Int;

    public running: boolean;

    constructor (fn: ConsumerFunction, synchronous: boolean, currentIndex: Int) {
        this.fn = fn;
        this.synchronous = synchronous;
        this.currentIndex = currentIndex;
        this.running = false;
    }

    async handleMessage (message: Message) {
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

    async run (stream: Stream, topic: Topic) {
        if (this.running) {
            return;
        }
        this.running = true;
        const messages = stream.getMessageHistory (topic);
        for (let i = 0; i < messages.length; i++) {
            const message = messages[i];
            await this.handleMessage (message);
        }
        this.running = false;
    }
}

export {
    Consumer
}
