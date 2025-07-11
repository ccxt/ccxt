import assert from 'assert';
import Stream from '../../../base/ws/Stream.js';
import { Message } from '../../../base/types.js';
import ccxt, { ExchangeClosedByUser } from '../../../../ccxt.js';

// Test case for producing a message
function testProduce () {
    console.log ('Starting testProduce...');
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
    console.log ('Starting testSubscribe...');
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
    console.log ('Starting testUnsubscribe...');
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
    console.log ('Starting testClose...');
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
    console.log ('Starting testSyncConsumerFunction...');
    const stream = new Stream ();
    const topic = "topic1";
    const payload = "hello world";

    function syncConsumer (message: Message) {
        assert.deepStrictEqual (message.payload, payload);
    }

    stream.subscribe (topic, syncConsumer);

    // Produce message
    stream.produce (topic, payload);
    stream.close ();
}

// Test async case
function testAsyncConsumerFunction () {
    console.log ('Starting testAsyncConsumerFunction...');
    const stream = new Stream ();
    const topic = "topic1";
    const payload = "hello world";

    async function asyncConsumer (message: Message) {
        assert.deepStrictEqual (message.payload, payload);
    }

    stream.subscribe (topic, asyncConsumer);

    // Produce message
    stream.produce (topic, payload);
    stream.close ();
}

// Test async case
async function testReconnect () {
    console.log ('Starting testReconnect...');
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

// Test case for ConsumerFunctionError wrapping
async function testConsumerFunctionErrorWrapping () {
    console.log ('Starting testConsumerFunctionErrorWrapping...');
    const stream = new Stream ();
    const topic = 'topic1';
    let errorCaught = false;
    let errorTypeCorrect = false;
    function consumerFn (message: Message) {
        throw new Error ('Consumer error');
    }
    function errorConsumer (message: Message) {
        if (message.error && message.error.name === 'ConsumerFunctionError') {
            errorTypeCorrect = true;
        }
        errorCaught = true;
    }
    stream.subscribe ('errors', errorConsumer);
    stream.subscribe (topic, consumerFn);
    stream.produce (topic, 'Hello, world!');
    // Wait for async error handling
    await new Promise ((resolve) => {
        setTimeout (resolve, 100);
    });
    assert (errorCaught, 'Error was not caught by errorConsumer');
    assert (errorTypeCorrect, 'Error was not wrapped as ConsumerFunctionError');
    stream.close ();
}

// Run the tests
export default async function testStream () {
    console.log ('=== Starting Stream Tests ===');
    testProduce ();
    console.log ('✓ testProduce completed');
    testSubscribe ();
    console.log ('✓ testSubscribe completed');
    testUnsubscribe ();
    console.log ('✓ testUnsubscribe completed');
    await testClose ();
    console.log ('✓ testClose completed');
    testSyncConsumerFunction ();
    console.log ('✓ testSyncConsumerFunction completed');
    testAsyncConsumerFunction ();
    console.log ('✓ testAsyncConsumerFunction completed');
    await testReconnect ();
    console.log ('✓ testReconnect completed');
    await testConsumerFunctionErrorWrapping ();
    console.log ('✓ testConsumerFunctionErrorWrapping completed');
    console.log ('=== All Stream Tests Completed ===');
}
