import { Int } from "../types";

export type Topic = string;

export interface Metadata {
    topic: Topic
    index: Int
}

export interface Message {
    payload: any;
    error: any;
    metadata: Metadata;
}

export type ConsumerFunction = (message: Message) => Promise<void> | void;

export interface Consumer {
    fn: ConsumerFunction;
    synchronous: boolean;
    currentIndex: number;
}

export class Stream {
    public maxMessagesPerTopic: Int;

    public topics: Map<Topic, Message[]>;

    private consumers: Map<Topic, Consumer[]>;

    constructor (maxMessagesPerTopic = undefined) {
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
                topic,
                index,
            }
        };

        if (this.maxMessagesPerTopic && messages.length >= this.maxMessagesPerTopic) {
            messages.shift ();
        }

        this.topics.get (topic).push (message);
        this.notifyConsumers (topic);
    }

    /**
     * Subscribes to a topic and registers a consumer function to handle incoming data.
     * @param topic - The topic to subscribe to.
     * @param consumerFn - The consumer function to handle incoming data.
     * @param synchronous - Optional. Indicates whether the consumer function should be executed synchronously or asynchronously. Default is true.
     */
    subscribe (topic: Topic, consumerFn: ConsumerFunction, synchronous: boolean = true): void {
        const consumer: Consumer = {
            fn: consumerFn,
            synchronous,
            currentIndex: this.getLastIndex (topic) + 1,
        };

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

    getLastIndex (topic: Topic): Int {
        let lastIndex = -1
        const messages = this.topics.get (topic)
        if (messages && messages.length > 0) {
            lastIndex = messages[-1].metadata.index;
        }
        return lastIndex;
    }

    private async handleConsumer (consumer: Consumer, topic: Topic): Promise<void> {
        const messages = this.getMessageHistory (topic);
        for (let i = 0; i < messages.length; i++) {
            const message = messages[i];
            if (message.metadata.index < consumer.currentIndex) {
                continue;
            }
            try {
                consumer.currentIndex = message.metadata.index;
                if (consumer.synchronous) {
                    await consumer.fn (message);
                } else {
                    consumer.fn (message);
                }
            } catch (e) {
                this.produce ('errors', null, e);
            }
        }
    }

    private notifyConsumers (topic: Topic): void {
        const topicConsumers = this.consumers.get (topic);
        if (topicConsumers) {
            for (let i = 0; i < topicConsumers.length; i++) {
                const promise = this.handleConsumer (topicConsumers[i], topic);
            }
        }
    }

    /**
     * Closes the stream by resetting the topics and unsubscribing consumers
     * Note: this won't cancel any ongoing consumers
     */
    close (): void {
        this.consumers = new Map ();
    }
}
