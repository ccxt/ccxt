<?php

namespace ccxtpro;

use \Ds\Deque;

class ArrayCache implements \JsonSerializable, \ArrayAccess, \IteratorAggregate, \Countable {
    public $max_size;
    public $deque;
    public $new_updates_by_symbol;
    public $clear_updates_by_symbol;

    public function __construct($max_size = null) {
        $this->max_size = $max_size;
        // the deque implemented in Ds has fast shifting by using doubly linked lists
        // https://www.php.net/manual/en/class.ds-deque.php
        // would inherit directly but it is marked as final
        $this->deque = new Deque();
        $this->new_updates_by_symbol = array();
        $this->clear_updates_by_symbol = array();
    }

    public function getIterator() {
        return $this->deque;
    }

    public function JsonSerialize () {
        return $this->deque;
    }

    public function getLimit($symbol, $limit) {
        if ($symbol === null) {
            $symbol = 'all';
        }
        $this->clear_updates_by_symbol[$symbol] = true;
        if ($limit === null) {
            return $this->new_updates_by_symbol[$symbol] ?? null;
        } else if ($this->new_updates_by_symbol[$symbol] ?? false) {
            return $limit;
        } else {
            return min($this->new_updates_by_symbol[$symbol], $limit);
        }
    }

    public function append($item) {
        if ($this->max_size && ($this->deque->count() === $this->max_size)) {
            $this->deque->shift();
        }
        $this->deque->push($item);
        if ($this->clear_updates_by_symbol[$item['symbol']] ?? false) {
            $this->clear_updates_by_symbol[$item['symbol']] = false;
            $this->new_updates_by_symbol[$item['symbol']] = 0;
        }
        if ($this->clear_updates_by_symbol['all'] ?? false) {
            $this->clear_updates_by_symbol['all'] = false;
            $this->new_updates_by_symbol['all'] = 0;
        }
        $this->new_updates_by_symbol[$item['symbol']] = ($this->new_updates_by_symbol[$item['symbol']] ?? 0) + 1;
        $this->new_updates_by_symbol['all'] = ($this->new_updates_by_symbol['all'] ?? 0) + 1;
    }

    public function count() {
        return $this->deque->count();
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
