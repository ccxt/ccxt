<?php

namespace ccxt\pro;

class ArrayCacheByOutcomeById extends ArrayCacheBySymbolById {
    public function __construct($max_size = null) {
        parent::__construct($max_size);
        $this->key_field = 'outcome';
    }
}
