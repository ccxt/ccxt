<?php

namespace ccxtpro;

class Future extends \React\Promise\Deferred {

    public function then(callable $onFulfilled = null, callable $onRejected = null): PromiseInterface {
        return $this->promise()->then($onFulfilled, $onRejected);
    }

};