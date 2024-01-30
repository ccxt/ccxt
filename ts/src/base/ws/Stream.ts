export type Topic = string;

export interface Message {
    payload: any;
    metadata: {
        topic: Topic;
        index: number;
    };
}

export type ConsumerFunction = (message: Message) => Promise<void> | void;

export interface Consumer {
    fn: ConsumerFunction;
    synchronous: boolean;
    currentIndex: number;
}

export class Stream {
    private topics: Map<Topic, Message[]>;

    private consumers: Map<Topic, Consumer[]>;

    constructor () {
        this.topics = new Map ();
        this.consumers = new Map ();
    }

    produce (topic: Topic, payload: any): void {
        if (!this.topics.has (topic)) {
            this.topics.set (topic, []);
        }

        const index = this.topics.get (topic)!.length;
        const message: Message = {
            payload,
            metadata: {
                topic,
                index
            }
        };

        this.topics.get (topic)!.push (message);
        this.notifyConsumers (topic);
    }

    subscribe (topic: Topic, consumerFn: ConsumerFunction, synchronous: boolean = true): void {
        const consumer: Consumer = {
            fn: consumerFn,
            synchronous,
            currentIndex: this.getMessageHistory (topic).length - 1
        };

        if (!this.consumers.has (topic)) {
            this.consumers.set (topic, []);
        }

        this.consumers.get (topic).push (consumer);
    }

    unsubscribe (topic: Topic, consumerFn: ConsumerFunction): void {
        if (this.consumers.has (topic)) {
            const consumersForTopic = this.consumers.get (topic)!;
            this.consumers.set (topic, consumersForTopic.filter ((consumer) => consumer.fn !== consumerFn));
        }
    }

    getMessageHistory (topic: Topic): Message[] {
        return this.topics.get (topic) || [];
    }

    private async notifyConsumers (topic: Topic): Promise<void> {
        const messages = this.getMessageHistory (topic);
        const topicConsumers = this.consumers.get (topic);

        if (topicConsumers) {
            for (const consumer of topicConsumers) {
                while (consumer.currentIndex < messages.length - 1) {
                    const message = messages[++consumer.currentIndex];
                    try {
                        if (consumer.synchronous) {
                            await consumer.fn (message);
                        } else {
                            consumer.fn (message);
                        }
                    } catch (e) {
                    }
                }
            }
        }
    }
}
