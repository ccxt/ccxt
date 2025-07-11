import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))
sys.path.append(root)

from ccxt.async_support.base.ws import stream  # noqa E402
import asyncio
import psutil
import ccxt.pro as ccxt
import socket
from ccxt.base.types import Message
from ccxt.base.errors import ConsumerFunctionError

# -*- coding: utf-8 -*-

# Test case for producing a message

# TODO: move to global test functions
def tcp_kill():
    current_process = psutil.Process(os.getpid())
    connections = current_process.connections(kind='tcp')
    for conn in connections:
        if conn.status == psutil.CONN_ESTABLISHED:
            sock = socket.fromfd(conn.fd, socket.AF_INET, socket.SOCK_STREAM)
            sock.shutdown(socket.SHUT_RDWR)
            sock.close()

def test_produce():
    _stream = stream.Stream()
    topic = 'topic1'
    payload = 'Hello, world!'
    error = 'Some error'
    _stream.produce(topic, payload, error)
    messages = _stream.get_message_history(topic)
    assert len(messages) == 1, 'Message was not produced'
    assert messages[0].payload == payload, 'Incorrect payload'
    assert messages[0].error == error, 'Incorrect error'


# Test case for subscribing to a topic
async def test_subscribe():
    _stream = stream.Stream()
    topic = 'topic1'
    received_message = False
    def consumer_fn(message: Message):
        nonlocal received_message
        received_message = True
        assert message.payload == 'Hello, world!', 'Incorrect payload'
    _stream.subscribe(topic, consumer_fn, True)
    _stream.produce(topic, 'Hello, world!')
    await asyncio.sleep(1)  # Wait for the message to be processed
    assert received_message, 'Consumer did not receive the message'
    received_message = False
    _stream.produce(topic, 'Hello, world!')
    await asyncio.sleep(1)  # Wait for the message to be processed
    assert received_message, 'Consumer did not receive the message'


# Test case for unsubscribing from a topic
def test_unsubscribe():
    _stream = stream.Stream()
    topic = 'topic1'
    received_message = False
    def consumer_fn(message: Message):
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
    def consumer_fn(message: Message):
        nonlocal received_message
        received_message = True
    _stream.subscribe(topic, consumer_fn)
    await _stream.close()
    received_message = False
    _stream.produce(topic, 'Hello, world!')
    await asyncio.sleep(1)
    assert not received_message, 'Consumer should not receive the message'


# Test sync case
def test_sync_consumer_function():
    _stream = stream.Stream()
    topic = 'topic1'
    payload = 'hello world'

    def sync_consumer(message: Message):
        assert message.payload == payload

    _stream.subscribe(topic, sync_consumer)
    # Produce message
    _stream.produce(topic, payload)


# Test async case
def test_async_consumer_function():
    _stream = stream.Stream()
    topic = 'topic1'
    payload = 'hello world'
    def async_consumer(message: Message):
        assert message.payload == payload

    _stream.subscribe(topic, async_consumer)
    # Produce message
    _stream.produce(topic, payload)

async def test_reconnect():
    received_message = False
    received_error = False
    def fnConsumer(message: Message):
        nonlocal received_message
        received_message = True
    def errorConsumer (message: Message):
        nonlocal received_error
        received_error = True
    ex = ccxt.binance()
    ex.subscribe_errors(errorConsumer)
    await ex.subscribe_trades('BTC/USDT', fnConsumer)
    await asyncio.sleep(1)
    assert received_message
    received_message = False
    tcp_kill()
    await asyncio.sleep(1)
    assert received_error
    received_error = False
    await asyncio.sleep(5)
    assert received_message
    received_message = False
    await ex.close()
    assert not received_error
    assert not received_message

async def test_consumer_function_error_wrapping():
    _stream = stream.Stream()
    topic = 'topic1'
    error_caught = False
    error_type_correct = False
    def consumer_fn(message: Message):
        raise Exception('Consumer error')
    def error_consumer(message: Message):
        nonlocal error_caught, error_type_correct
        if message.error and isinstance(message.error, ConsumerFunctionError):
            error_type_correct = True
        error_caught = True
    _stream.subscribe('errors', error_consumer)
    _stream.subscribe(topic, consumer_fn)
    _stream.produce(topic, 'Hello, world!')
    await asyncio.sleep(0.1)
    assert error_caught, 'Error was not caught by error_consumer'
    assert error_type_correct, 'Error was not wrapped as ConsumerFunctionError'

    # Test with async consumer function that raises an exception
    error_caught_async = False
    error_type_correct_async = False
    async def async_consumer_fn(message: Message):
        raise Exception('Async consumer error')
    def error_consumer_async(message: Message):
        nonlocal error_caught_async, error_type_correct_async
        if message.error and isinstance(message.error, ConsumerFunctionError):
            error_type_correct_async = True
        error_caught_async = True
    _stream.subscribe('errors', error_consumer_async)
    _stream.subscribe('topic_async', async_consumer_fn)
    _stream.produce('topic_async', 'Hello, world!')
    await asyncio.sleep(0.5)
    assert error_caught_async, 'Error was not caught by error_consumer_async'
    assert error_type_correct_async, 'Error was not wrapped as ConsumerFunctionError (async)'
    await _stream.close()

# Run the tests
async def test_stream():
    await test_consumer_function_error_wrapping()
    await test_reconnect()
    test_produce()
    await test_subscribe()
    test_unsubscribe()
    await test_close()
    test_sync_consumer_function()
    test_async_consumer_function()

asyncio.run(test_stream())
