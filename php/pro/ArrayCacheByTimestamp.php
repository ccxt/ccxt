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
        $key = $this->as_string($item[0]);
        if (array_key_exists($key, $this->hashmap)) {
            $prev_ref = &$this->hashmap[$key];
            # OHLCV rows are lists, so a field-wise merge only walks the indices
            # the incoming row happens to have - a shorter update then leaves the
            # previous row's trailing values in place, e.g. [100,1,2,3,4,5]
            # followed by [100,9,9] used to yield [100,9,9,3,4,5]. Replace the
            # whole row through the reference: the hashmap entry and the deque
            # row alias the same zval, so both see the truncation
            $prev_ref = $item;
            unset($prev_ref);
        } else {
            $this->hashmap[$key] = &$item;
            if ($this->max_size && (count($this->deque) === $this->max_size)) {
                $delete_reference = array_shift($this->deque);
                unset($this->hashmap[$this->as_string($delete_reference[0])]);
            }
            # this allows us to effectively pass by reference
            //array_push($this->deque->push(null);
            $this->deque[] = &$item;
        }
        if ($this->clear_updates) {
            $this->clear_updates = false;
            $this->size_tracker = array();
        }
        $this->size_tracker[$key] = 1;
        $this->new_updates = count($this->size_tracker);
    }

    public function clear() {
        parent::clear();
        # the hashmap and the size tracker must be wiped together with the
        # deque, otherwise a re-appended timestamp is swallowed as a duplicate
        $this->hashmap = array();
        $this->size_tracker = array();
        $this->new_updates = 0;
        $this->clear_updates = false;
    }
}
