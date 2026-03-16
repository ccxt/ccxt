import { Int, ConsumerFunction, Message } from "../types";
import FastQueue from "./FastQueue.js";
interface ConsumerOptions {
    synchronous?: boolean;
    maxBacklogSize?: number;
    log?: (...args: any[]) => void;
}
export default class Consumer {
    fn: ConsumerFunction;
    synchronous: boolean;
    currentIndex: Int;
    running: boolean;
    backlog: FastQueue<Message>;
    maxBacklogSize: number;
    log: (...args: any[]) => void;
    private static readonly DEFAULT_MAX_BACKLOG_SIZE;
    constructor(fn: ConsumerFunction, currentIndex: Int, options?: ConsumerOptions);
    publish(message: Message): void;
    _run(): Promise<void>;
    _handleMessage(message: Message): Promise<void>;
}
export { Consumer, ConsumerOptions };
