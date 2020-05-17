<?php

namespace ccxtpro;

use \Ds\Deque;

class ArrayCache extends \ArrayObject implements \JsonSerializable {
    public $max_size;
    public $deque;

    public function __construct($max_size) {
        parent::__construct();
        $this->max_size = $max_size;
        // the deque implemented in Ds has fast shifting by using doubly linked lists
        // https://www.php.net/manual/en/class.ds-deque.php
        // would inherit directly but it is marked as final
        $this->deque = new Deque();
    }

    public function getIterator() {
        return $this->deque;
    }

    public function JsonSerialize () {
        return $this->deque;
    }

    public function append($item) {
        $this->deque->push($item);
        if ($this->deque->count() > $this->max_size) {
            $this->deque->shift();
        }
    }

    public function count() {
        return $this->deque->count();
    }

    public function clear() {
        return $this->deque->clear();
    }
}
