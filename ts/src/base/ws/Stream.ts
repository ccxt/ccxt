import { Int, Message, Topic, ConsumerFunction, BaseStream, Dictionary } from "../types";
import { Consumer } from "./Consumer.js";

export class Stream implements BaseStream {
    public maxMessagesPerTopic: Int;

    public topics: Dictionary<Message[]>;

    public verbose: boolean;

    public autoreconnect: boolean;

    public consumers: Dictionary<Consumer[]>;

    public activeWatchFunctions: any[];

    constructor (maxMessagesPerTopic = 10000, verbose = false) {
        this.init (maxMessagesPerTopic, verbose);
    }

    init (maxMessagesPerTopic = 10000, verbose = false) {
        this.maxMessagesPerTopic = maxMessagesPerTopic
        this.verbose = verbose;
        this.topics = {};
        this.consumers = {};
        if (this.verbose) {
            console.log ('stream initialized')
        }
    }

    produce (topic: Topic, payload: any, error: any = null): void {
        if (!this.topics[topic]) {
            this.topics[topic] = [];
        }

        const messages = this.topics[topic];
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

        this.topics[topic].push (message);
        const consumers = this.consumers[topic] || [];
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

        if (!this.consumers[topic]) {
            this.consumers[topic] = [];
        }

        this.consumers[topic].push (consumer);
        if (this.verbose) {
            console.log ('subscribed function to topic: ', topic, ' synchronous: ', synchronous);
        }
    }

    /**
     * Unsubscribes a consumer function from a topic.
     * @param topic - The topic to unsubscribe from.
     * @param consumerFn - The consumer function to unsubscribe.
     */
    unsubscribe (topic: Topic, consumerFn: ConsumerFunction): void {
        if (this.consumers[topic]) {
            const consumersForTopic = this.consumers[topic];
            this.consumers[topic] = consumersForTopic.filter ((consumer) => consumer.fn !== consumerFn);
            if (this.verbose) {
                console.log ('unsubscribed function from topic: ', topic);
            }
        } else {
            if (this.verbose) {
                console.log ('unsubscribe failed: consumer not found for topic: ', topic);
            }
        }
    }

    /**
     * Retrieves the message history for a given topic.
     * @param topic - The topic for which to retrieve the message history.
     * @returns An array of messages representing the message history for the given topic.
     */
    getMessageHistory (topic: Topic): Message[] {
        return this.topics[topic] || [];
    }

    /**
     * Returns the last index of the given topic.
     * @param topic - The topic to get the last index for.
     * @returns The last index of the topic.
     */
    getLastIndex (topic: Topic): Int {
        let lastIndex = -1
        const messages = this.topics[topic];
        if (messages && messages.length > 0) {
            lastIndex = messages[messages.length - 1].metadata.index;
        }
        return lastIndex;
    }

    private sendToConsumers (consumers: Consumer[], message: Message): void {
        if (this.verbose) {
            console.log ('sending message from topic ', message.metadata.topic, 'to ', consumers.length, ' consumers');
        }
        for (let i = 0; i < consumers.length; i++) {
            const consumer = consumers[i];
            consumer.publish (message);
        }
    }

    public addWatchFunction (watchFn: string, args: any[]): void {
        this.activeWatchFunctions.push ({ 'method': watchFn, 'args': args })
    }

    /**
     * Closes the stream by resetting the topics and unsubscribing consumers
     * Note: this won't cancel any ongoing consumers
     */
    close (): void {
        if (this.verbose) {
            console.log ('closing stream');
        }
        const config = {
            'maxMessagesPerTopic': this.maxMessagesPerTopic,
            'verbose': this.verbose,
        }
        this.init (this.maxMessagesPerTopic);
    }
}

export default Stream
