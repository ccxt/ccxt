<?php

namespace ccxtpro;

class ArrayCacheBySymbolById extends ArrayCacheById {

    public function append($item) {
        if (array_key_exists($item['symbol'], $this->index)) {
            $by_id = $this->index[$item['symbol']];
        } else {
            $by_id = array();
        }
        if (array_key_exists($item['id'], $by_id)) {
            $prev_ref = &$by_id[$item['id']];
            # updates the reference
            $prev_ref = $item;
        } else {
            $by_id[$item['id']] = &$item;
            if ($this->deque->count() === $this->max_size) {
                $delete_reference = $this->deque->shift();
                unset($by_id[$delete_reference['id']]);
            }
            # this allows us to effectively pass by reference
            $this->parent_append(null);
            $this->deque[$this->deque->count() - 1] = &$item;
        }
        $this->index[$item['symbol']] = $by_id;
    }
}
