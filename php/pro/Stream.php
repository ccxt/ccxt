<?php

namespace ccxt\pro;

use React\Async;

class Metadata {
    public $topic;
    public $index;

    public function __construct($topic, $index) {
        $this->topic = $topic;
        $this->index = $index;
    }
}

class Message {
    public $payload;
    public $error;
    public $metadata;

    public function __construct($payload, $error, $topic, $index) {
        $this->payload = $payload;
        $this->error = $error;
        $this->metadata = new Metadata($topic, $index);
    }
}

class Consumer {
    public $fn;
    public $synchronous;
    public $current_index;

    public function __construct(callable $fn, $synchronous, $current_index) {
        $this->fn = $fn;
        $this->synchronous = $synchronous;
        $this->current_index = $current_index;
    }
}

class Stream {
    public $max_messages_per_topic;
    public $topics = [];
    private $consumers = [];

    public function __construct($max_messages_per_topic = null) {
        $this->max_messages_per_topic = $max_messages_per_topic;
    }

    public function produce($topic, $payload, $error = null) {
        if (!isset($this->topics[$topic])) {
            $this->topics[$topic] = [];
        }

        $messages = &$this->topics[$topic];
        $index = count($messages) > 0 ? end($messages)->metadata->index + 1 : 0;
        $message = new Message($payload, $error, $topic, $index);

        if ($this->max_messages_per_topic !== null && count($messages) >= $this->max_messages_per_topic) {
            array_shift($messages);
        }

        $messages[] = $message;
        $this->notify_consumers($topic);
    }

    public function subscribe($topic, callable $consumerFn, $synchronous = true) {
        $consumer = new Consumer($consumerFn, $synchronous, $this->get_last_index($topic) + 1);
        if (!isset($this->consumers[$topic])) {
            $this->consumers[$topic] = [];
        }
        $this->consumers[$topic][] = $consumer;
    }

    public function unsubscribe($topic, callable $consumerFn) {
        if (isset($this->consumers[$topic])) {
            $this->consumers[$topic] = array_filter($this->consumers[$topic], function ($consumer) use ($consumerFn) {
                return $consumer->fn !== $consumerFn;
            });
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

    public function handle_consumer(Consumer $consumer, $topic)
    {
        $messages = $this->get_message_history($topic);

        foreach ($messages as $message) {
            if ($message->metadata->index < $consumer->current_index) {
                continue;
            }
            $consumer->current_index = $message->metadata->index;
            try {
                // Check if consumer function is asynchronous
                $result = call_user_func($consumer->fn, $message);
                if ($result instanceof \React\Promise\PromiseInterface && $consumer->synchronous) {
                    // Convert to promise and handle asynchronously
                    Async\await ($result);
                }
            } catch (Exception $e) {
                $this->produce('errors', null, $e);
            }
        }
    }

    private function notify_consumers($topic) {
        if (isset($this->consumers[$topic])) {
            foreach ($this->consumers[$topic] as $consumer) {
                $this->handle_consumer($consumer, $topic);
            }
        }
    }
    
    public function close () {
        $this->topics = [];
        $this->consumers = [];
    }
}
