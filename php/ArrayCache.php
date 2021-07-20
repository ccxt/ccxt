<?php

namespace ccxtpro;

class ArrayCache extends BaseCache {
    public $new_updates_by_symbol;
    public $clear_updates_by_symbol;

    public function __construct($max_size = null) {
        parent::__construct($max_size);
        $this->new_updates_by_symbol = array();
        $this->clear_updates_by_symbol = array();
    }

    public function getLimit($symbol, $limit) {
        if ($symbol === null) {
            $symbol = 'all';
        }
        $this->clear_updates_by_symbol[$symbol] = true;
        if ($limit === null) {
            return $this->new_updates_by_symbol[$symbol] ?? null;
        } else if ($this->new_updates_by_symbol[$symbol] ?? false) {
            return $limit;
        } else {
            return min($this->new_updates_by_symbol[$symbol], $limit);
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
        if ($this->clear_updates_by_symbol['all'] ?? false) {
            $this->clear_updates_by_symbol['all'] = false;
            $this->new_updates_by_symbol['all'] = 0;
        }
        $this->new_updates_by_symbol[$item['symbol']] = ($this->new_updates_by_symbol[$item['symbol']] ?? 0) + 1;
        $this->new_updates_by_symbol['all'] = ($this->new_updates_by_symbol['all'] ?? 0) + 1;
    }
}
