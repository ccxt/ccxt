<?php

namespace ccxt\pro;

use SplDoublyLinkedList;

class BaseCache implements \JsonSerializable, \ArrayAccess, \IteratorAggregate, \Countable {
    public $max_size;
    public $deque;

    public function __construct($max_size = null) {
        $this->max_size = $max_size;
        // the deque implemented in Ds has fast shifting by using doubly linked lists
        // https://www.php.net/manual/en/class.ds-deque.php
        // would inherit directly but it is marked as final
        $this->deque = array();
        // default mode
        // $this->deque->setIteratorMode(SplDoublyLinkedList::IT_MODE_FIFO | SplDoublyLinkedList::IT_MODE_KEEP);
    }

    public function getIterator() : \Traversable {
        return new \ArrayObject($this->deque);
    }

    public function JsonSerialize() : array {
        return $this->deque;
    }

    public function count() : int {
        return count($this->deque);
    }

    public function clear() {
        $this->deque = array();
    }

    public function &offsetGet($offset) : mixed {
        return $this->deque[$offset];
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

    public function __toString() {
        return print_r($this->deque, true);
    }
}
