<?php

namespace ccxt\pro;

class ArrayCacheByTimestamp extends BaseCache {
    public $hashmap;
    private $size_tracker;
    public $new_updates;
    public $clear_updates;

    public function __construct($max_size = null) {
        parent::__construct($max_size);
        $this->hashmap = array();
        $this->size_tracker = array();
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
            if (count($this->deque) === $this->max_size) {
                $delete_reference = array_shift($this->deque);
                unset($this->hashmap[$delete_reference[0]]);
            }
            # this allows us to effectively pass by reference
            //array_push($this->deque->push(null);
            $this->deque[] = &$item;
        }
        if ($this->clear_updates) {
            $this->clear_updates = false;
            $this->size_tracker = array();
        }
        $this->size_tracker[$item[0]] = 1;
        $this->new_updates = count($this->size_tracker);
    }
}
