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

    public function __construct($max_messages_per_topic = 10000, $verbose = false) {
        $this->max_messages_per_topic = $max_messages_per_topic;
        $this->verbose = $verbose;
        if ($this->verbose) {
            print_r ('stream initialized');
        }
    }

    public function produce($topic, $payload, $error = null) {
        if (!isset($this->topics[$topic])) {
            $this->topics[$topic] = [];
        }

        $messages = $this->topics[$topic];
        $index = $this->get_last_index($topic) + 1;
        $message = new Message($payload, $error, $this, $topic, $index);

        if ($this->max_messages_per_topic !== null && count($messages) >= $this->max_messages_per_topic) {
            array_shift($messages);
        }

        array_push($this->topics[$topic], $message);
        $consumers = $this->consumers[$topic] ?? [];
        $this->send_to_consumers($consumers, $message);
    }

    public function subscribe($topic, callable $consumerFn, $synchronous = true) {
        $consumer = new Consumer($consumerFn, $synchronous, $this->get_last_index($topic));
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
        }
        if ($this->verbose) {
            print_r ("Unable to unsubscribe function from topic: " . $topic . ". Consumer function not found.\n");
        }
    }

    public function get_message_history($topic) {
        return isset($this->topics[$topic]) ? $this->topics[$topic] : [];
    }

    private function get_last_index($topic): int {
        $last_index = -1;
        if (isset($this->topics[$topic]) && count($this->topics[$topic]) > 0) {
            $messages = $this->topics[$topic];
            $last_message = end($messages);
            $last_index = $last_message->metadata->index;
        }
        return $last_index;
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
        if ($this->verbose) {
            print_r ("Closed stream\n");
        }
    }
}
