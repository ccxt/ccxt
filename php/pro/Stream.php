<?php

namespace ccxt\pro;

use ccxt\pro\Consumer;

class Metadata {
    public $stream;
    public $topic;
    public $index;
    public $history;

    public function __construct($stream, $topic, $index) {
        $this->stream = $stream;
        $this->topic = $topic;
        $this->index = $index;
        $this->history = $this->stream->get_message_history($topic);
    }
}

class Message {
    public $payload;
    public $error;
    public $metadata;

    public function __construct($payload, $error, $stream, $topic, $index) {
        $this->payload = $payload;
        $this->error = $error;
        $this->metadata = new Metadata($stream, $topic, $index);
    }
}

class Stream {
    public $max_messages_per_topic;
    public $verbose;
    public $topics = array();
    private $consumers = array();
    public $active_watch_functions = array();
    public $topicIndexes = array();

    public function __construct($max_messages_per_topic = 0, $verbose = false) {
        $this->max_messages_per_topic = $max_messages_per_topic;
        $this->verbose = $verbose;
        $this->topicIndexes = array();
    }

    public function produce($topic, $payload, $error = null) {
        if (!isset($this->topics[$topic])) {
            $this->topics[$topic] = [];
        }
        if (!isset($this->topicIndexes[$topic])) {
            $this->topicIndexes[$topic] = -1;
        }
        $this->topicIndexes[$topic] += 1;
        $index = $this->topicIndexes[$topic];
        $messages = $this->topics[$topic];
        $message = new Message($payload, $error, $this, $topic, $index);

        if (count($messages) > $this->max_messages_per_topic) {
            array_shift($messages);
        }
        if ($this->max_messages_per_topic !== 0) {
            array_push($this->topics[$topic], $message);
        }

        $consumers = $this->consumers[$topic] ?? [];
        $this->send_to_consumers($consumers, $message);
    }

    public function subscribe($topic, callable $consumerFn, $synchronous = true) {
        $consumer = new Consumer($consumerFn, $this->get_last_index($topic), ['synchronous' => $synchronous]);
        if (!isset($this->consumers[$topic])) {
            $this->consumers[$topic] = [];
        }
        $this->consumers[$topic][] = $consumer;
        if ($this->verbose) {
            print_r ("Subscribed function to topic: " . $topic . "\n");
        }
    }

    public function unsubscribe($topic, callable $consumerFn) {
        if (isset($this->consumers[$topic])) {
            $this->consumers[$topic] = array_filter($this->consumers[$topic], function ($consumer) use ($consumerFn) {
                return $consumer->fn !== $consumerFn;
            });
            if ($this->verbose) {
                print_r ("Unsubscribed function from topic: " . $topic . "\n");
            }
            return true;
        }
        if ($this->verbose) {
            print_r ("Unable to unsubscribe function from topic: " . $topic . ". Consumer function not found.\n");
        }
        return false;
    }

    public function get_message_history($topic) {
        return isset($this->topics[$topic]) ? $this->topics[$topic] : [];
    }

    private function get_last_index($topic): int {
        if (isset($this->topicIndexes[$topic])) {
            return $this->topicIndexes[$topic];
        }
        return -1;
    }

    private function send_to_consumers($consumers, $message) {
        if ($this->verbose) {
            print_r ('sending message from topic ' . $message->metadata->topic, 'to consumers');
        }
        foreach ($consumers as $consumer) {
            $consumer->publish($message);
        }
    }

    public function add_watch_function($watchFn, $args) {
        $this->active_watch_functions[] = array('method' => $watchFn, 'args' => $args);
    }

    
    public function close () {
        $this->topics = [];
        $this->consumers = [];
        $this->topicIndexes = array();
        if ($this->verbose) {
            print_r ("Closed stream\n");
        }
    }
}
