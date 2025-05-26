import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))
sys.path.append(root)

from ccxt.async_support.base.ws import stream  # noqa E402
import asyncio
import psutil
import ccxt.pro as ccxt
import socket
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
    def consumer_fn(message):
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
    received_message = False
    _stream.produce(topic, 'Hello, world!')
    await asyncio.sleep(1)
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

async def test_reconnect():
    received_message = False
    received_error = False
    def fnConsumer(message):
        nonlocal received_message
        received_message = True
    def errorConsumer (message):
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

# Run the tests
async def test_stream():
    await test_reconnect()
    test_produce()
    await test_subscribe()
    test_unsubscribe()
    await test_close()
    test_sync_consumer_function()
    test_async_consumer_function()

asyncio.run(test_stream())
