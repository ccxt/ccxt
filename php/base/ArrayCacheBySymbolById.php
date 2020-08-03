<?php

namespace ccxtpro;

class ArrayCacheBySymbolById extends ArrayCache {

    public function match($a, $b) {
        return ($a['id'] === $b['id']) && ($a['symbol'] === $b['symbol']);
    }

    public function append($item) {
        $first_match_index = null;
        for ($k = 0; $k < $this->deque->count(); $k++) {
            if ($this->match($this->deque[$k], $item)) {
                $first_match_index = $k;
                break;
            }
        }
        if (is_null($first_match_index)) {
            parent::append($item);
        } else {
            $this->deque->set($first_match_index, $item);
        }
    }
}
