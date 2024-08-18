import assert from 'assert';
import Stream from '../../../base/ws/Stream.js';
import { Message } from '../../../base/types.js';
import ccxt, { ExchangeClosedByUser } from '../../../../ccxt.js';

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
async function testClose () {
    const stream = new Stream ();
    const topic = 'topic1';
    let receivedMessage = false;

    function consumerFn (message: Message) {
        receivedMessage = true;
    }

    stream.subscribe (topic, consumerFn);

    await stream.close ();

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
// Test async case
async function testReconnect () {
    let receivedMessage = false;
    let receivedError = false;
    function fnConsumer (message) {
        receivedMessage = true;
    }
    const errorConsumer = (message) => {
        if (!(message.error instanceof ExchangeClosedByUser)) {
            receivedError = true;
        }
    };
    const ex = new ccxt.pro.binance ();
    ex.subscribeErrors (errorConsumer);
    await ex.subscribeTrades ('BTC/USDT', fnConsumer);
    await ex.sleep (1000);
    assert (receivedMessage);
    receivedMessage = false;
    const keys = Object.keys (ex.clients);
    ex.clients[keys[0]].onError ("Some error");
    await ex.sleep (500);
    assert (receivedError);
    receivedError = false;
    await ex.sleep (5000);
    assert (receivedMessage);
    await ex.close ();
    receivedMessage = false;
    assert (!receivedError);
    assert (!receivedMessage);
}

// Run the tests
export default async function testStream () {
    testProduce ();
    testSubscribe ();
    testUnsubscribe ();
    await testClose ();
    testSyncConsumerFunction ();
    testAsyncConsumerFunction ();
    await testReconnect ();
}
