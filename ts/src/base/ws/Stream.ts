import { Int, Message, Topic, ConsumerFunction, BaseStream } from "../types";
import { Consumer } from "./Consumer.js";

export class Stream implements BaseStream {
    public maxMessagesPerTopic: Int;

    public topics: Map<Topic, Message[]>;

    private consumers: Map<Topic, Consumer[]>;

    constructor (maxMessagesPerTopic = undefined) {
        this.init (maxMessagesPerTopic);
    }

    init (maxMessagesPerTopic = undefined) {
        this.maxMessagesPerTopic = maxMessagesPerTopic;
        this.topics = new Map ();
        this.consumers = new Map ();
    }

    /**
     * Produces a message for the specified topic.
     * @param topic - The topic to produce the message for.
     * @param payload - The payload of the message.
     * @param error - The error associated with the message (optional).
     */
    produce (topic: Topic, payload: any, error: any = null): void {
        if (!this.topics.has (topic)) {
            this.topics.set (topic, []);
        }

        const messages = this.topics.get (topic);
        const index = this.getLastIndex (topic) + 1;

        const message: Message = {
            payload,
            error,
            metadata: {
                stream: this,
                topic,
                index,
                history: messages.slice (),
            },
        };

        if (this.maxMessagesPerTopic && messages.length >= this.maxMessagesPerTopic) {
            messages.shift ();
        }

        this.topics.get (topic).push (message);
        const consumers = this.consumers.get (topic) || [];
        this.sendToConsumers (consumers, message);
    }

    /**
     * Subscribes to a topic and registers a consumer function to handle incoming data.
     * Current index is the index of the last message consumed
     * @param topic - The topic to subscribe to.
     * @param consumerFn - The consumer function to handle incoming data.
     * @param synchronous - Optional. Indicates whether the consumer function should be executed synchronously or asynchronously. Default is true.
     */
    subscribe (topic: Topic, consumerFn: ConsumerFunction, synchronous: boolean = true): void {
        const consumer = new Consumer (consumerFn, synchronous, this.getLastIndex (topic));

        if (!this.consumers.has (topic)) {
            this.consumers.set (topic, []);
        }

        this.consumers.get (topic).push (consumer);
    }

    /**
     * Unsubscribes a consumer function from a topic.
     * @param topic - The topic to unsubscribe from.
     * @param consumerFn - The consumer function to unsubscribe.
     */
    unsubscribe (topic: Topic, consumerFn: ConsumerFunction): void {
        if (this.consumers.has (topic)) {
            const consumersForTopic = this.consumers.get (topic)!;
            this.consumers.set (topic, consumersForTopic.filter ((consumer) => consumer.fn !== consumerFn));
        }
    }

    /**
     * Retrieves the message history for a given topic.
     * @param topic - The topic for which to retrieve the message history.
     * @returns An array of messages representing the message history for the given topic.
     */
    getMessageHistory (topic: Topic): Message[] {
        return this.topics.get (topic) || [];
    }

    /**
     * Returns the last index of the given topic.
     * @param topic - The topic to get the last index for.
     * @returns The last index of the topic.
     */
    getLastIndex (topic: Topic): Int {
        let lastIndex = -1
        const messages = this.topics.get (topic)
        if (messages && messages.length > 0) {
            lastIndex = messages[messages.length - 1].metadata.index;
        }
        return lastIndex;
    }

    private sendToConsumers (consumers: Consumer[], message: Message): void {
        for (let i = 0; i < consumers.length; i++) {
            const consumer = consumers[i];
            consumer.publish (message);
        }
    }

    /**
     * Closes the stream by resetting the topics and unsubscribing consumers
     * Note: this won't cancel any ongoing consumers
     */
    close (): void {
        this.init (this.maxMessagesPerTopic);
    }
}

export default Stream
