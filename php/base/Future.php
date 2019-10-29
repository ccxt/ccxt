<?php

namespace ccxt;
require_once __DIR__ . '/../vendor/autoload.php';


class Future {
    private $deferred;
    public function __construct() {
        $this->deferred = new \React\Promise\Deferred();
    }

    public function resolve($result) {
        $this->deferred->resolve($result);
    }

    public function reject($result) {
        $this->deferred->reject($result);

    }

    public function promise() {
        return $this->deferred->promise();
    }
}
