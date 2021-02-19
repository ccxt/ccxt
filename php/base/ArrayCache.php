<?php

namespace ccxtpro;

use \Ds\Deque;

class ArrayCache implements \JsonSerializable, \ArrayAccess, \IteratorAggregate, \Countable {
    public $max_size;
    public $deque;
    public $new_updates;
    public $clear_updates;

    public function __construct($max_size = null) {
        $this->max_size = $max_size;
        // the deque implemented in Ds has fast shifting by using doubly linked lists
        // https://www.php.net/manual/en/class.ds-deque.php
        // would inherit directly but it is marked as final
        $this->deque = new Deque();
        $this->new_updates = 0;
        $this->clear_updates = false;
    }

    public function getIterator() {
        return $this->deque;
    }

    public function JsonSerialize () {
        return $this->deque;
    }

    public function getLimit($limit) {
        $this->clear_updates = true;
        if ($limit === null) {
            return $this->new_updates;
        }
        return min($this->new_updates, $limit);
    }

    public function append($item) {
        if ($this->max_size && ($this->deque->count() === $this->max_size)) {
            $this->deque->shift();
        }
        $this->deque->push($item);
        if ($this->clear_updates) {
            $this->clear_updates = false;
            $this->new_updates = 0;
        }
    }

    public function count() {
        return $this->deque->count();
    }

    public function clear_new_updates() {
        $this->new_updates = array();
    }

    public function clear() {
        $this->deque->clear();
    }

    public function offsetGet($index) {
        return $this->deque[$index];
    }

    public function offsetSet($index, $newval) {
        $this->deque[$index] = $newval;
    }

    public function offsetExists($index) {
        return $index < $this->count();
    }

    public function offsetUnset($index) {
        unset($this->deque[$index]);
    }

    public function getArrayCopy() {
        return $this->deque->toArray();
    }

    public function __toString() {
        return print_r($this->deque->toArray(), true);
    }
}
