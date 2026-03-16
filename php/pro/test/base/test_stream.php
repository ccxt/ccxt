<?php
namespace ccxt;
include_once('./ccxt.php');

use ccxt\pro\Stream;

function test_produce() {
    $stream = new Stream(5);
    $topic = 'topic1';
    $payload = 'Hello, world!';
    $error = null;
    $stream->produce($topic, $payload, $error);
    $messages = $stream->get_message_history($topic);
    assert(count($messages) === 1, 'Message was not produced');
    assert($messages[0]->payload === $payload, 'Incorrect payload');
    assert($messages[0]->error === $error, 'Incorrect error');
}


// Test case for subscribing to a topic
function test_subscribe() {
    $stream = new Stream(); // Ensure correct namespace
    $topic = 'topic1';
    $received_message = false;
    $consumer_fn = function ($message) use (&$received_message) { // Use 'use' keyword to bring $received_message into scope
        $received_message = true;
        assert($message->payload === 'Hello, world!', 'Incorrect payload');
    };
    $stream->subscribe($topic, $consumer_fn);
    $stream->produce($topic, 'Hello, world!');
    assert($received_message, 'Consumer did not receive the message');
}

// Test case for unsubscribing from a topic
function test_unsubscribe() {
    $stream = new Stream();
    $topic = 'topic1';
    $received_message = false;
    $consumer_fn = function ($message) use (&$received_message) { // Use 'use' keyword to bring $received_message into scope
        $received_message = true;
    };
    $stream->subscribe($topic, $consumer_fn);
    $stream->unsubscribe($topic, $consumer_fn);
    $stream->produce($topic, 'Hello, world!');
    assert(!$received_message, 'Consumer should not receive the message');
}


// Test case for closing the stream
function test_close() {
    $stream = new Stream();
    $topic = 'topic1';
    $received_message = false;
    $consumer_fn = function ($message) use (&$received_message) { // Use 'use' keyword to bring $received_message into scope
        $received_message = true;
    };
    $stream->subscribe($topic, $consumer_fn);
    $stream->close();
    $stream->produce($topic, 'Hello, world!');
    assert(!$received_message, 'Consumer should not receive the message');
}


// Test sync case
function test_sync_consumer_function() {
    $stream = new Stream();
    $topic = 'topic1';
    $payload = 'hello world';
    $sync_consumer = function ($message) use ($payload) {
        assert($message->payload == $payload);
    };
    $stream->subscribe($topic, $sync_consumer);
    // Produce message
    $stream->produce($topic, $payload);
}


// Test async case
function test_async_consumer_function() {
    $stream = new Stream();
    $topic = 'topic1';
    $payload = 'hello world';
    $async_consumer = function ($message) use ($payload) {
        assert($message->payload == $payload);
    };
    $stream->subscribe($topic, $async_consumer);
    // Produce message
    $stream->produce($topic, $payload);
}


// Run the tests
function test_stream() {
    test_produce();
    test_subscribe();
    test_unsubscribe();
    test_close();
    test_sync_consumer_function();
    test_async_consumer_function();
}

?>
