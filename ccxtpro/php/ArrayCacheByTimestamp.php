<?php

namespace ccxtpro;

use \Ds\Set;

class ArrayCacheByTimestamp extends BaseCache {
    public $hashmap;
    private $size_tracker;
    public $new_updates;
    public $clear_updates;

    public function __construct($max_size = null) {
        parent::__construct($max_size);
        $this->hashmap = array();
        $this->size_tracker = new Set();
        $this->new_updates = 0;
        $this->clear_updates = false;
    }

    public function getLimit($symbol, $limit) {
        $this->clear_updates = true;
        if ($limit === null) {
            return $this->new_updates;
        }
        return min($this->new_updates, $limit);
    }

    public function append($item) {
        if (array_key_exists($item[0], $this->hashmap)) {
            $prev_ref = &$this->hashmap[$item[0]];
            # updates the reference
            $prev_ref = $item;
        } else {
            $this->hashmap[$item[0]] = &$item;
            if ($this->deque->count() === $this->max_size) {
                $delete_reference = $this->deque->shift();
                unset($this->hashmap[$delete_reference[0]]);
            }
            # this allows us to effectively pass by reference
            $this->deque->push(null);
            $this->deque[$this->deque->count() - 1] = &$item;
        }
        if ($this->clear_updates) {
            $this->clear_updates = false;
            $this->size_tracker->clear();
        }
        $this->size_tracker->add($item[0]);
        $this->new_updates = count($this->size_tracker);
    }
}
