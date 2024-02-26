import assert from 'assert';
import Stream from '../../../base/ws/Stream.js';
import { Message } from '../../../base/types.js';

// Test case for producing a message
function testProduce () {
    const stream = new Stream ();
    const topic = 'topic1';
    const payload = 'Hello, world!';
    const error = null;

    stream.produce (topic, payload, error);

    const messages = stream.getMessageHistory (topic);
    assert (messages.length === 1, 'Message was not produced');
    assert (messages[0].payload === payload, 'Incorrect payload');
    assert (messages[0].error === error, 'Incorrect error');
}

// Test case for subscribing to a topic
function testSubscribe () {
    const stream = new Stream ();
    const topic = 'topic1';
    let receivedMessage = false;

    function consumerFn (message: Message) {
        receivedMessage = true;
        assert (message.payload === 'Hello, world!', 'Incorrect payload');
    }

    stream.subscribe (topic, consumerFn);

    stream.produce (topic, 'Hello, world!');

    assert (receivedMessage, 'Consumer did not receive the message');
}

// Test case for unsubscribing from a topic
function testUnsubscribe () {
    const stream = new Stream ();
    const topic = 'topic1';
    let receivedMessage = false;

    function consumerFn (message: Message) {
        receivedMessage = true;
    }

    stream.subscribe (topic, consumerFn);
    stream.unsubscribe (topic, consumerFn);

    stream.produce (topic, 'Hello, world!');

    assert (!receivedMessage, 'Consumer should not receive the message');
}

// Test case for closing the stream
function testClose () {
    const stream = new Stream ();
    const topic = 'topic1';
    let receivedMessage = false;

    function consumerFn (message: Message) {
        receivedMessage = true;
    }

    stream.subscribe (topic, consumerFn);

    stream.close ();

    stream.produce (topic, 'Hello, world!');

    assert (!receivedMessage, 'Consumer should not receive the message');
}

// Test sync case
function testSyncConsumerFunction () {
    const stream = new Stream ();
    const topic = "topic1";
    const payload = "hello world";

    function syncConsumer (message: Message) {
        assert.deepStrictEqual (message.payload, payload);
    }

    stream.subscribe (topic, syncConsumer);

    // Produce message
    stream.produce (topic, payload);
}

// Test async case
function testAsyncConsumerFunction () {
    const stream = new Stream ();
    const topic = "topic1";
    const payload = "hello world";

    async function asyncConsumer (message: Message) {
        assert.deepStrictEqual (message.payload, payload);
    }

    stream.subscribe (topic, asyncConsumer);

    // Produce message
    stream.produce (topic, payload);
}

// Run the tests
testProduce ();
testSubscribe ();
testUnsubscribe ();
testClose ();
testSyncConsumerFunction ();
testAsyncConsumerFunction ();
