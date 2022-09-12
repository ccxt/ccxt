<?php

namespace ccxtpro;

use Ds\Deque;
use Ds\Set;

class ArrayCacheBySymbolById extends ArrayCache {
    public $hashmap;
    private $index;

    public function __construct($max_size = null) {
        parent::__construct($max_size);
        $this->nested_new_updates_by_symbol = true;
        $this->hashmap = array();
        $this->index = new Deque();
    }

    public function append($item) {
        if (array_key_exists($item['symbol'], $this->hashmap)) {
            $by_id = &$this->hashmap[$item['symbol']];
        } else {
            $by_id = array();
            $this->hashmap[$item['symbol']] = &$by_id;
        }
        if (array_key_exists($item['id'], $by_id)) {
            $prev_ref = &$by_id[$item['id']];
            # updates the reference
            $prev_ref = $item;
            $item = &$prev_ref;
            $index = $this->index->find($item['id']);
            unset($this->index[$index]);
            unset($this->deque[$index]);
        } else {
            $by_id[$item['id']] = &$item;
            if ($this->deque->count() === $this->max_size) {
                $delete_item = $this->deque->shift();
                $this->index->shift();
                unset($this->hashmap[$delete_item['symbol']][$delete_item['id']]);
            }
        }
        # this allows us to effectively pass by reference
        $this->deque->push(null);
        $this->deque[$this->deque->count() - 1] = &$item;
        $this->index->push($item['id']);
        if (!array_key_exists($item['symbol'], $this->new_updates_by_symbol)) {
            $this->new_updates_by_symbol[$item['symbol']] = new Set();
        }
        if ($this->clear_updates_by_symbol[$item['symbol']] ?? false) {
            $this->clear_updates_by_symbol[$item['symbol']] = false;
            $this->new_updates_by_symbol[$item['symbol']]->clear();
        }
        if ($this->clear_all_updates) {
            $this->clear_all_updates = false;
            $this->all_new_updates = 0;
        }
        $id_set = $this->new_updates_by_symbol[$item['symbol']];
        $before_length = count($id_set);
        $id_set->add($item['id']);
        $after_length = count($id_set);
        $this->all_new_updates = ($this->all_new_updates ?? 0) + ($after_length - $before_length);
    }
}
