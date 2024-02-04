from typing import Any, Callable, Dict, List
from asyncio import Future, iscoroutinefunction
import asyncio

# Define type aliases for clarity
Topic = str
MessagePayload = Any
ConsumerFunction = Callable[['Message'], Future[None] | None]

class Metadata:
    def __init__(self, topic: Topic, index: int):
        self.topic = topic
        self.index = index


class Message:
    def __init__(self, payload: Any, error: Any, topic: Topic, index: int):
        self.payload = payload
        self.error = error
        self.metadata = Metadata (topic, index)
class Consumer:
    def __init__(self, fn: ConsumerFunction, synchronous: bool, current_index: int):
        self.fn = fn
        self.synchronous = synchronous
        self.current_index = current_index

class Stream:
    def __init__(self, max_messages_per_topic = None):
        """
        Initializes a new Stream object.
        :param int max_messages_per_topic: Maximum number of messages per topic. Defaults to None.
        """
        self.topics: Dict[Topic, List[Message]] = {}
        self.consumers: Dict[Topic, List[Consumer]] = {}
        self.max_messages_per_topic = max_messages_per_topic
        self.tasks = []

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

        message = Message(payload, error, topic, index)

        if self.max_messages_per_topic and len(messages) >= self.max_messages_per_topic:
            messages.pop(0)

        self.topics[topic].append(message)
        asyncio.ensure_future(self.notify_consumers(topic))

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

    def unsubscribe(self, topic: Topic, consumer_fn: ConsumerFunction) -> None:
        """
        Unsubscribes a consumer function from a topic.
        :param Topic topic: The topic to unsubscribe from.
        :param ConsumerFunction consumer_fn: The consumer function to unsubscribe.
        """
        if topic in self.consumers:
            self.consumers[topic] = [consumer for consumer in self.consumers[topic] if consumer.fn != consumer_fn]

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

    
    async def handle_consumer(self, consumer, topic):
        messages = self.get_message_history(topic)
        for message in messages:
            if message.metadata['index'] < consumer.current_index:
                continue
            try:
                consumer.current_index = message.metadata['index']
                if consumer.synchronous and iscoroutinefunction(consumer.fn):
                    await consumer.fn(message)
                else:
                    consumer.fn(message)
            except Exception as e:
                self.produce('errors', None, e)

    async def notify_consumers(self, topic: Topic) -> None:
        topic_consumers = self.consumers.get(topic, [])
        if topic_consumers:
            for consumer in topic_consumers:
                task = asyncio.create_task(self.handle_consumer(consumer, topic))
                task.add_done_callback(self.task_done_callback)
                self.tasks.append(task)
            await asyncio.gather(*self.tasks, return_exceptions=True)

    def task_done_callback(self, task: asyncio.Task) -> None:
        self.tasks.remove(task)

    async def close(self) -> None:
        """
        Closes the stream. This cancels all pending tasks.
        """
        # Cancel all pending tasks
        for task in self.tasks:
            task.cancel()
        # Wait for all tasks to be cancelled
        await asyncio.gather(*self.tasks, return_exceptions=True)
        self.stream = Stream ()
