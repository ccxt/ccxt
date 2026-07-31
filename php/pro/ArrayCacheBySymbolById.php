<?php

namespace ccxt\pro;

class ArrayCacheBySymbolById extends ArrayCache {
    public $hashmap;
    public $key_field;
    private $index;

    public function __construct($max_size = null) {
        parent::__construct($max_size);
        $this->nested_new_updates_by_symbol = true;
        $this->key_field = 'symbol'; // first nesting level (overridden by ArrayCacheByOutcomeById)
        $this->hashmap = array();
        $this->index = array();
    }

    public function append($item) {
        $key = $item[$this->key_field];
        if (array_key_exists($key, $this->hashmap)) {
            $by_id = &$this->hashmap[$key];
        } else {
            $by_id = array();
            $this->hashmap[$key] = &$by_id;
        }
        if (array_key_exists($item['id'], $by_id)) {
            $prev_ref = &$by_id[$item['id']];
            # updates the reference
            $prev_ref = $item;
            $item = &$prev_ref;
            $index = array_search($item['id'], $this->index);
            array_splice($this->index, $index, 1);
            array_splice($this->deque, $index, 1);
        } else {
            $by_id[$item['id']] = &$item;
            if (count($this->deque) === $this->max_size) {
                $delete_item = array_shift($this->deque);
                array_shift($this->index);
                unset($this->hashmap[$delete_item[$this->key_field]][$delete_item['id']]);
            }
        }
        # this allows us to effectively pass by reference
        $this->deque[] = &$item;
        $this->index[] = $item['id'];
        if ($this->clear_all_updates) {
            $this->clear_all_updates = false;
            $this->clear_updates_by_symbol = array();
            $this->all_new_updates = 0;
            $this->new_updates_by_symbol = array();
        }
        if (!array_key_exists($key, $this->new_updates_by_symbol)) {
            $this->new_updates_by_symbol[$key] = array();
        }
        if ($this->clear_updates_by_symbol[$key] ?? false) {
            $this->clear_updates_by_symbol[$key] = false;
            $this->new_updates_by_symbol[$key] = array();
        }
        $id_set = &$this->new_updates_by_symbol[$key];
        $before_length = count($id_set);
        $id_set[$item['id']] = 1;
        $after_length = count($id_set);
        $this->all_new_updates = ($this->all_new_updates ?? 0) + ($after_length - $before_length);
    }
}
