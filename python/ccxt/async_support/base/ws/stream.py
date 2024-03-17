from typing import Any, Callable, Dict, List
from asyncio import Future
from ....base.types import Topic, Message
from .consumer import Consumer

# Define type aliases for clarity
MessagePayload = Any
ConsumerFunction = Callable[['Message'], Future[None] | None]


class Stream:
    def __init__(self, max_messages_per_topic: int = 10000, verbose: bool = False):
        """
        Initializes a new Stream object.
        :param int max_messages_per_topic: Maximum number of messages per topic. Defaults to None.
        """
        self.topics: Dict[Topic, List[Message]] = {}
        self.consumers: Dict[Topic, List[Consumer]] = {}
        self.max_messages_per_topic = max_messages_per_topic
        self.verbose = verbose
        self.active_watch_functions: List[str, List[Any]] = []
        if self.verbose:
            print('stream initialized')

    def produce(self, topic: Topic, payload: Any, error: Any = None) -> None:
        """
        Produces a new message for a topic.
        :param Topic topic: The topic to produce the message for.
        :param Any payload: The payload of the message.
        :param Any error: Any error associated with the message. Defaults to None.
        """
        if topic not in self.topics:
            self.topics[topic] = []

        messages = self.topics[topic]
        index = self.get_last_index (topic) + 1

        message = Message(payload, error, self, topic, index)

        if self.max_messages_per_topic and len(messages) >= self.max_messages_per_topic:
            messages.pop(0)

        self.topics[topic].append(message)
        consumers = self.consumers.get(topic, [])
        self.send_to_consumers(consumers, message)
        if self.verbose:
            print(f'Produced message for topic: {topic}. Total messages now: {len(messages)}.')

    def subscribe(self, topic: Topic, consumer_fn: ConsumerFunction, synchronous: bool = True) -> None:
        """
        Subscribes a consumer function to a topic.
        :param Topic topic: The topic to subscribe to.
        :param ConsumerFunction consumer_fn: The consumer function to subscribe.
        :param bool synchronous: Whether the consumer function should be called synchronously. Defaults to True.
        """
        consumer = Consumer(consumer_fn, synchronous, self.get_last_index(topic) + 1)
        if topic not in self.consumers:
            self.consumers[topic] = []
        self.consumers[topic].append(consumer)
        if self.verbose:
            print(f'Subscribed to topic: {topic}. Total consumers for topic now: {len(self.consumers[topic])}.')

    def unsubscribe(self, topic: Topic, consumer_fn: ConsumerFunction) -> None:
        """
        Unsubscribes a consumer function from a topic.
        :param Topic topic: The topic to unsubscribe from.
        :param ConsumerFunction consumer_fn: The consumer function to unsubscribe.
        """
        if topic in self.consumers:
            self.consumers[topic] = [consumer for consumer in self.consumers[topic] if consumer.fn != consumer_fn]
            if self.verbose:
                print(f'Unsubscribed consumer from topic: {topic}. Total consumers for topic now: {len(self.consumers[topic])}.')
        else:
            print(f'Unable to unsubscribe. Could not find consumer for topic: {topic}')

    def get_message_history(self, topic: Topic) -> List[Message]:
        """
        Gets the message history for a topic.
        :param Topic topic: The topic to get the message history for.
        :returns List[Message]: The message history for the topic.
        """
        return self.topics.get(topic, [])


    def get_last_index (self, topic: Topic) -> int:
        """
        Gets the last index for a topic. Returns -1 if the topic has no messages.
        :param Topic topic: The topic to get the last index for.
        :returns int: The last index for the topic.
        """
        last_index = -1
        messages = self.topics.get(topic, [])
        if len(messages) > 0:
            last_index = messages[-1].metadata.index
        return last_index

    def send_to_consumers(self, consumers, message):
        for consumer in consumers:
            consumer.publish(message)
        if self.verbose:
            print(f'Sending message to {len(consumers)} consumers for topic {message.metadata.topic}.')
    
    def add_watch_function (self, watchFn: str, args: List[Any]):
        self.active_watch_functions.append ({ 'method': watchFn, 'args': args })


    async def close(self) -> None:
        """
        Closes the stream. This cancels all pending tasks.
        """
        for consumers in self.consumers.values():
            for consumer in consumers:
                await consumer.close()
        if self.verbose:
            print("closed stream")
        self.stream = Stream()
