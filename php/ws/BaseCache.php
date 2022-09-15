<?php

namespace ccxtpro;

use Ds\Deque;

class BaseCache implements \JsonSerializable, \ArrayAccess, \IteratorAggregate, \Countable {
    public $max_size;
    public $deque;

    public function __construct($max_size = null) {
        $this->max_size = $max_size;
        // the deque implemented in Ds has fast shifting by using doubly linked lists
        // https://www.php.net/manual/en/class.ds-deque.php
        // would inherit directly but it is marked as final
        $this->deque = new Deque();
    }

    public function getIterator() : \Traversable {
        return $this->deque;
    }

    public function JsonSerialize() : Deque {
        return $this->deque;
    }

    public function count() : int {
        return $this->deque->count();
    }

    public function clear() {
        $this->deque->clear();
    }

    public function offsetGet($index) : mixed {
        return $this->deque[$index];
    }

    public function offsetSet($index, $newval) : void {
        $this->deque[$index] = $newval;
    }

    public function offsetExists($index) : bool {
        return $index < $this->count();
    }

    public function offsetUnset($index) : void {
        unset($this->deque[$index]);
    }

    public function getArrayCopy() {
        return $this->deque->toArray();
    }

    public function __toString() {
        return print_r($this->deque->toArray(), true);
    }
}
