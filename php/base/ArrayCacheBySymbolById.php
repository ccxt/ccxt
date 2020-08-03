<?php

namespace ccxtpro;

class ArrayCacheBySymbolById extends ArrayCache {
    public $hashmap;

    public function __construct($max_size = null) {
        parent::__construct($max_size);
        $this->hashmap = array();
    }

    public function append($item) {
         $default_get = function ($array, $value) {
            if (isset($array[$value])) {
                return $array[$value];
            } else {
                return array();
            }
        };
        $by_ids = $default_get($this->hashmap, $item['symbol']);
        if (array_key_exists($item['id'], $this->hashmap)) {
            $reference = &$by_ids[$item['id']];
            # updates the reference lol php
            $reference = $item;
        } else {
            $by_ids[$item['id']] = $item;
            if ($this->max_size && count($this) == $this->max_size) {
                $delete_reference = &$this->deque->pop();
                unset($by_ids[$delete_reference['id']]);
            }
            $this->deque->push($item);
        }
    }
}
