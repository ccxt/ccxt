<?php

namespace ccxt\pro;

class ArrayCacheBySymbolBySide extends ArrayCache {
    public $hashmap;
    private $index;
    private $hedged;

    public function __construct($max_size = null, $hedged = True) {
        parent::__construct($max_size);
        $this->nested_new_updates_by_symbol = true;
        $this->hashmap = array();
        $this->index = array();
        $this->hedged = $hedged;
    }

    public function append($item) {
        if (array_key_exists($item['symbol'], $this->hashmap)) {
            $by_side = &$this->hashmap[$item['symbol']];
            if ($this->hedged) {
                $side_to_reset = $by_side == 'long' ?  'short' : 'long';
                if (array_key_exists($side_to_reset, $by_side)) {
                    $index = array_search($side_to_reset, $this->index);
                    array_splice ($this->index, $index, 1);
                    array_splice ($this->deque, $index, 1);
                }
            }
        } else {
            $by_side = array();
            $this->hashmap[$item['symbol']] = &$by_side;
        }
        if (array_key_exists($item['side'], $by_side)) {
            $prev_ref = &$by_side[$item['side']];
            # updates the reference
            $prev_ref = $item;
            $item = &$prev_ref;
            $index = array_search($item['side'], $this->index);
            array_splice($this->index, $index, 1);
            array_splice($this->deque, $index, 1);
        } else {
            $by_side[$item['side']] = &$item;
            if (count($this->deque) === $this->max_size) {
                $delete_item = array_shift($this->deque);
                array_shift($this->index);
                unset($this->hashmap[$delete_item['symbol']][$delete_item['side']]);
            }
        }
        # this allows us to effectively pass by reference
        $this->deque[] = &$item;
        $this->index[] = $item['side'];
        if ($this->clear_all_updates) {
            $this->clear_all_updates = false;
            $this->clear_updates_by_symbol = array();
            $this->all_new_updates = 0;
            $this->new_updates_by_symbol = array();
        }
        if (!array_key_exists($item['symbol'], $this->new_updates_by_symbol)) {
            $this->new_updates_by_symbol[$item['symbol']] = array();
        }
        if ($this->clear_updates_by_symbol[$item['symbol']] ?? false) {
            $this->clear_updates_by_symbol[$item['symbol']] = false;
            $this->new_updates_by_symbol[$item['symbol']] = array();
        }
        $side_set = &$this->new_updates_by_symbol[$item['symbol']];
        $before_length = count($side_set);
        $side_set[$item['side']] = 1;
        $after_length = count($side_set);
        $this->all_new_updates = ($this->all_new_updates ?? 0) + ($after_length - $before_length);
    }
}
