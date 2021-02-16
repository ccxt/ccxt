<?php

namespace ccxtpro;

class ArrayCacheByTimestamp extends ArrayCache {
    public $hashmap;
    public $new_updates;
    public $new_updates_hashmap;

    public function __construct($max_size = null) {
        parent::__construct($max_size);
        $this->hashmap = array();
        $this->new_updates_hashmap = array();
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
            $this->parent_append(null);
            $this->deque[$this->deque->count() - 1] = &$item;
        }
        if (!array_key_exists($item[0], $this->new_updates_hashmap)) {
            $this->new_updates_hashmap[$item[0]] = true;
            $this->new_updates[] = $item;
        }
    }

    public function clear_new_updates() {
        $this->new_updates = array();
        $this->new_updates_hashmap = array();
    }
}
