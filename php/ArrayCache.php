<?php

namespace ccxtpro;

class ArrayCache extends BaseCache {
    public $new_updates_by_symbol;
    public $clear_updates_by_symbol;

    public function __construct($max_size = null) {
        parent::__construct($max_size);
        $this->nested_new_updates_by_symbol = false;
        $this->new_updates_by_symbol = array();
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
            $new_updates_value = $this->new_updates_by_symbol[$symbol];
            if (($new_updates_value !== null) && $this->nested_new_updates_by_symbol) {
                $new_updates_value = count($new_updates_value);
            }
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
        if ($this->max_size && ($this->deque->count() === $this->max_size)) {
            $this->deque->shift();
        }
        $this->deque->push($item);
        if ($this->clear_updates_by_symbol[$item['symbol']] ?? false) {
            $this->clear_updates_by_symbol[$item['symbol']] = false;
            $this->new_updates_by_symbol[$item['symbol']] = 0;
        }
        if ($this->clear_all_updates) {
            $this->clear_all_updates = false;
            $this->all_new_updates = 0;
        }
        $this->new_updates_by_symbol[$item['symbol']] = ($this->new_updates_by_symbol[$item['symbol']] ?? 0) + 1;
        $this->all_new_updates = ($this->all_new_updates ?? 0) + 1;
    }
}
