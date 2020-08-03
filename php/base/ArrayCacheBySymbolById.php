<?php

namespace ccxtpro;

class ArrayCacheBySymbolById extends ArrayCache {

    public function append($item) {
        $first_match_index = null;
        for ($k = 0; $k < $this->deque->count(); $k++) {
            $stored = $this->deque[$k];
            if (($stored['id'] === $item['id']) && ($stored['symbol'] === $item['symbol'])) {
                $first_match_index = $k;
                break;
            }
        }
        if (is_null($first_match_index)) {
            $this->deque->push($item);
            if ($this->max_size && ($this->deque->count() > $this->max_size)) {
                $this->deque->shift();
            }
        } else {
            $this->deque->set($first_match_index, $item);
        }
    }
}
