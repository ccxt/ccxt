import { Int, Message, Topic, ConsumerFunction, BaseStream, Dictionary } from "../types";
import { Consumer } from "./Consumer.js";
interface SubscribeParams {
    synchronous?: boolean;
    consumerMaxBacklogSize?: number;
}
export declare class Stream implements BaseStream {
    maxMessagesPerTopic: Int;
    topics: Dictionary<Message[]>;
    verbose: boolean;
    consumers: Dictionary<Consumer[]>;
    topicIndexes: Dictionary<Int>;
    activeWatchFunctions: any[];
    log: (...args: any[]) => void;
    constructor(maxMessagesPerTopic?: number, verbose?: boolean, log?: (...args: any[]) => void);
    init(maxMessagesPerTopic?: number, verbose?: boolean): void;
    produce(topic: Topic, payload: any, error?: any): void;
    /**
     * Subscribes to a topic and registers a consumer function to handle incoming data.
     * Current index is the index of the last message consumed
     * @param topic - The topic to subscribe to.
     * @param consumerFn - The consumer function to handle incoming data.
     * @param params - Optional. Parameters object that may contain synchronous and consumerMaxBacklogSize.
     */
    subscribe(topic: Topic, consumerFn: ConsumerFunction, params?: SubscribeParams): void;
    /**
     * Unsubscribes a consumer function from a topic.
     * @param topic - The topic to unsubscribe from.
     * @param consumerFn - The consumer function to unsubscribe.
     * @returns true if the consumer was successfully unsubscribed, false otherwise.
     */
    unsubscribe(topic: Topic, consumerFn: ConsumerFunction): boolean;
    /**
     * Retrieves the message history for a given topic.
     * @param topic - The topic for which to retrieve the message history.
     * @returns An array of messages representing the message history for the given topic.
     */
    getMessageHistory(topic: Topic): Message[];
    /**
     * Returns the last index of the given topic.
     * @param topic - The topic to get the last index for.
     * @returns The last index of the topic.
     */
    getLastIndex(topic: Topic): Int;
    /**
     * Sends a message to all consumers of a topic.
     * @param consumers {Consumer[]} - array of consumers
     * @param message {Message} - message to publish
     */
    private sendToConsumers;
    /**
     * Adds a watch function to the stream. This is used to reconnect in case of any disconnectons.
     * @param watchFn {string} - the watchFunction name
     * @param args {any[]} - the arguments to pass to the watchFunction
     */
    addWatchFunction(watchFn: string, args: any[]): void;
    /**
     * Closes the stream by resetting the topics and unsubscribing consumers
     * Note: this won't cancel any ongoing consumers
     */
    close(): void;
}
export default Stream;
export { SubscribeParams };
