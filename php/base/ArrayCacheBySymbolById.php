<?php

namespace ccxtpro;

class ArrayCacheBySymbolById extends ArrayCacheByTimestamp {
    private $index_counter;
    private $index_tracker;

    public function __construct($max_size = null) {
        parent::__construct($max_size);
        $this->index_counter = 0;
        $this->index_tracker = array();
    }

    public function append($item) {
        if (array_key_exists($item['symbol'], $this->hashmap)) {
            $by_id = $this->hashmap[$item['symbol']];
        } else {
            $by_id = array();
        }
        if (array_key_exists($item['id'], $by_id)) {
            $prev_ref = &$by_id[$item['id']];
            # updates the reference
            $prev_ref = $item;
            $index = $this->index_counter - $this->index_tracker['id'];
            unset($this->deque[$index]);
        } else {
            $by_id[$item['id']] = &$item;
            if ($this->deque->count() === $this->max_size) {
                $delete_reference = $this->deque->shift();
                unset($by_id[$delete_reference['id']]);
                unset($this->index_tracker[$delete_reference['id']]);
            }
        }
        # this allows us to effectively pass by reference
        $this->deque->push(null);
        $this->deque[$this->deque->count() - 1] = &$item;
        if ($this->clear_updates) {
            $this->clear_updates = false;
            $this->new_updates = 0;
        }
        $this->new_updates++;
        $this->index_counter++;
    }
}
