<?php

namespace ccxtpro;

use \Ds\Deque;

class ArrayCache implements \JsonSerializable, \ArrayAccess, \IteratorAggregate, \Countable {
    public $max_size;
    public $deque;
    public $new_updates;

    public function __construct($max_size = null) {
        $this->max_size = $max_size;
        // the deque implemented in Ds has fast shifting by using doubly linked lists
        // https://www.php.net/manual/en/class.ds-deque.php
        // would inherit directly but it is marked as final
        $this->deque = new Deque();
        $this->new_updates = array();
    }

    public function getIterator() {
        return $this->deque;
    }

    public function JsonSerialize () {
        return $this->deque;
    }

    public function append($item) {
        $this->deque->push($item);
        $this->new_updates[] = $item;
        if ($this->max_size && ($this->deque->count() > $this->max_size)) {
            $this->deque->shift();
        }
        if ($this->max_size && (count($this->new_updates) > $this->max_size)) {
            array_shift($this->new_updates);
        }
    }

    public function parent_append($item) {
        $this->deque->push($item);
        if ($this->max_size && ($this->deque->count() > $this->max_size)) {
            $this->deque->shift();
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
