import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
sys.path.append(root)

from ccxt.async_support.base.ws import stream  # noqa E402
import asyncio

# -*- coding: utf-8 -*-

# Test case for producing a message
def test_produce():
    _stream = stream.Stream()
    topic = 'topic1'
    payload = 'Hello, world!'
    error = None
    _stream.produce(topic, payload, error)
    messages = _stream.get_message_history(topic)
    assert len(messages) == 1, 'Message was not produced'
    assert messages[0].payload == payload, 'Incorrect payload'
    assert messages[0].error == error, 'Incorrect error'


# Test case for subscribing to a topic
async def test_subscribe():
    _stream = stream.Stream()
    topic = 'topic1'
    _stream.verbose = True
    received_message = False
    def consumer_fn(message):
        nonlocal received_message
        received_message = True
        assert message.payload == 'Hello, world!', 'Incorrect payload'
    _stream.subscribe(topic, consumer_fn, True)
    _stream.produce(topic, 'Hello, world!')
    await asyncio.sleep(1) # Wait for the message to be processed
    assert received_message, 'Consumer did not receive the message'
    received_message = False
    _stream.produce(topic, 'Hello, world!')
    await asyncio.sleep(1) # Wait for the message to be processed
    assert received_message, 'Consumer did not receive the message'


# Test case for unsubscribing from a topic
def test_unsubscribe():
    _stream = stream.Stream()
    topic = 'topic1'
    received_message = False
    def consumer_fn(message):
        nonlocal received_message
        received_message = True
    _stream.subscribe(topic, consumer_fn)
    _stream.unsubscribe(topic, consumer_fn)
    _stream.produce(topic, 'Hello, world!')
    assert not received_message, 'Consumer should not receive the message'


# Test case for closing the stream
async def test_close():
    _stream = stream.Stream()
    topic = 'topic1'
    received_message = False
    def consumer_fn(message):
        nonlocal received_message
        received_message = True
    _stream.subscribe(topic, consumer_fn)
    await _stream.close()
    _stream.produce(topic, 'Hello, world!')
    asyncio.sleep(1)
    assert not received_message, 'Consumer should not receive the message'


# Test sync case
def test_sync_consumer_function():
    _stream = stream.Stream()
    topic = 'topic1'
    payload = 'hello world'
    
    def sync_consumer(message):
        assert message.payload == payload
    
    _stream.subscribe(topic, sync_consumer)
    # Produce message
    _stream.produce(topic, payload)


# Test async case
def test_async_consumer_function():
    _stream = stream.Stream()
    topic = 'topic1'
    payload = 'hello world'
    def async_consumer(message):
        assert message.payload == payload
        
    _stream.subscribe(topic, async_consumer)
    # Produce message
    _stream.produce(topic, payload)


# Run the tests
async def test_stream():
    test_produce()
    await test_subscribe()
    test_unsubscribe()
    await test_close()
    test_sync_consumer_function()
    test_async_consumer_function()

asyncio.run(test_stream())
