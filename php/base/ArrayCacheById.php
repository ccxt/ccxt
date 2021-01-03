<?php

namespace ccxtpro;

class ArrayCacheById extends ArrayCache {
    public $index;

    public function __construct($max_size = null) {
        parent::__construct($max_size);
        $this->index = array();
    }

    public function parent_append($item) {
        parent::append($item);
    }

    public function append($item) {
        if (array_key_exists($item['id'], $this->index)) {
            $prev_ref = &$this->index[$item['id']];
            # updates the reference
            $prev_ref = $item;
        } else {
            $this->index[$item['id']] = &$item;
            if ($this->deque->count() === $this->max_size) {
                $delete_reference = $this->deque->shift();
                unset($this->index[$delete_reference['id']]);
            }
            # this allows us to effectively pass by reference
            $this->parent_append(null);
            $this->deque[$this->deque->count() - 1] = &$item;
        }
    }
}
