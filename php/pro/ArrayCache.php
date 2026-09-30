<?php

namespace ccxt\pro;

class ArrayCache extends BaseCache {
    public $hashmap;
    public $new_updates_by_symbol;
    public $seen_updates_by_symbol;
    public $seen_updates_all;
    public $clear_updates_by_symbol;
    public $nested_new_updates_by_symbol;
    public $all_new_updates;
    public $clear_all_updates;

    public function __construct($max_size = null) {
        parent::__construct($max_size);
        $this->hashmap = array();
        $this->nested_new_updates_by_symbol = false;
        // $new_updates_by_symbol holds a plain integer count per key. The keyed
        // subclasses count DISTINCT ids / sides, so they keep the membership set
        // itself in $seen_updates_by_symbol and write its size back here - that
        // way getLimit() never has to guess whether it is holding a number or a
        // set, and never type-puns one for the other
        $this->new_updates_by_symbol = array();
        $this->seen_updates_by_symbol = array();
        # the same, but cleared only by the GLOBAL getLimit() scope - the two poll
        # scopes are independent, so each needs its own memory of what it has seen
        $this->seen_updates_all = array();
        $this->clear_updates_by_symbol = array();
        $this->all_new_updates = 0;
        $this->clear_all_updates = false;
    }

    public function getLimit($symbol, $limit) {
        $new_updates_value = null;

        if ($symbol === null) {
            $new_updates_value = $this->all_new_updates;
            $this->clear_all_updates = true;
        } else {
            // always an int, for every cache flavour
            $new_updates_value = $this->new_updates_by_symbol[$symbol] ?? null;
            $this->clear_updates_by_symbol[$symbol] = true;
        }

        if ($new_updates_value === null) {
            return $limit;
        }
        else if ($limit !== null) {
            return min($new_updates_value, $limit);
        } else {
            return $new_updates_value;
        }
    }

    public function append($item) {
        if ($this->max_size && (count($this->deque) === $this->max_size)) {
            array_shift($this->deque);
        }
        $this->deque[] = $item;
        if ($this->clear_all_updates) {
            $this->clear_all_updates = false;
            # the global poll consumes only the global scope
            $this->all_new_updates = 0;
            $this->seen_updates_all = array();
        }
        // prediction-market items carry an `outcome` handle instead of a `symbol`
        $symbol = $item['symbol'] ?? $item['outcome'] ?? '';
        if ($this->clear_updates_by_symbol[$symbol] ?? false) {
            $this->clear_updates_by_symbol[$symbol] = false;
            $this->new_updates_by_symbol[$symbol] = 0;
        }
        $this->new_updates_by_symbol[$symbol] = ($this->new_updates_by_symbol[$symbol] ?? 0) + 1;
        $this->all_new_updates = ($this->all_new_updates ?? 0) + 1;
    }

    public function clear() {
        # the keyed index and the new-updates bookkeeping have to be wiped
        # together with the deque, otherwise a re-appended row is matched
        # against a hashmap entry whose deque row no longer exists
        parent::clear();
        $this->hashmap = array();
        $this->new_updates_by_symbol = array();
        $this->seen_updates_by_symbol = array();
        $this->seen_updates_all = array();
        $this->clear_updates_by_symbol = array();
        $this->all_new_updates = 0;
        $this->clear_all_updates = false;
    }
}
