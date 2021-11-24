<?php


namespace ccxt;

use ArrayObject;

class Headers extends ArrayObject {
    public $headers;

    public function __construct($value, $headers) {
        parent::__construct($value);
        $this->headers = $headers;
    }

    public function __debugInfo() {
        return $this->getArrayCopy();
    }
}
