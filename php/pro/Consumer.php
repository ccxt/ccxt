<?php

namespace ccxt\pro;

use React\Async;
use React\Promise;

class Consumer
{
    private const MAX_BACKLOG_SIZE = 100;  // Maximum number of messages in backlog
    
    public $fn;
    public $synchronous;
    public $currentIndex;
    public $running = false;
    public $backlog = [];

    public function __construct(callable $fn, bool $synchronous, int $currentIndex)
    {
        $this->fn = $fn;
        $this->synchronous = $synchronous;
        $this->currentIndex = $currentIndex;
        $this->running = false;
    }

    public function publish($message)
    {
        array_push($this->backlog, $message);
        if (count($this->backlog) > self::MAX_BACKLOG_SIZE) {
            error_log("Warning: WebSocket consumer backlog is too large (" . count($this->backlog) . " messages). This might indicate a performance issue or message processing bottleneck.");
        }
        $this->run();
    }

    private function run()
    {
        if ($this->running) {
            return;
        }
        return Async\async (function () {
            $this->running = true;

            while (count($this->backlog) > 0) {
                $message = array_shift($this->backlog);
                Async\await($this->handle_message($message));
            }
            $this->running = false;
        })();
    }

    private function handle_message($message)
    {
        return Async\async(function () use ($message) {
            if ($message->metadata->index <= $this->currentIndex) {
                return;
            }
            $this->currentIndex = $message->metadata->index;
            $callback = $this->fn;
            $isAsync = $callback instanceof Promise\PromiseInterface;
            if ($this->synchronous && $isAsync) {
                Async\await ($callback($message));
            } else if ($isAsync) {
                Async\async(function () use ($callback, $message) {
                    return Async\await($callback($message));
                }) ();
            } else {
                $callback($message);
            }  
        })();
    }
}
