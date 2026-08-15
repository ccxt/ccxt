<?php

namespace ccxt\pro;

class ArrayCacheBySymbolById extends ArrayCache {
    public $hashmap;
    public $key_field;
    private $index;

    public function __construct($max_size = null) {
        parent::__construct($max_size);
        $this->nested_new_updates_by_symbol = true;
        $this->key_field = 'symbol'; // first nesting level (overridden by ArrayCacheByOutcomeById)
        $this->hashmap = array();
        $this->index = array();
    }

    public function append($item) {
        $key = $this->as_string($item[$this->key_field]);
        $id = $this->as_string($item['id']);
        if (array_key_exists($key, $this->hashmap)) {
            $by_id = &$this->hashmap[$key];
        } else {
            $by_id = array();
            $this->hashmap[$key] = &$by_id;
        }
        if (array_key_exists($id, $by_id)) {
            $prev_ref = &$by_id[$id];
            # field-wise merge, mirroring `for (const prop in item)` in the
            # typescript source - a partial update (say `{ status: closed }`)
            # must not drop the fee, amount, trades ... it does not mention
            foreach ($item as $prop => $value) {
                $prev_ref[$prop] = $value;
            }
            $item = &$prev_ref;
            # match the (key_field, id) PAIR strictly - different symbols can
            # share an order id (binance uses per-symbol id sequences), so
            # matching on id alone would splice the wrong row, see
            # https://github.com/ccxt/ccxt/issues/26092. The key is length
            # prefixed rather than plainly concatenated: a bare $key . $id
            # collides, eg ('BTC/USDT1', '2') and ('BTC/USDT', '12') both
            # yield "BTC/USDT12", whereas "9:BTC/USDT12" and "8:BTC/USDT12"
            # are distinct for every possible pair
            $index = array_search($this->index_key($key, $id), $this->index, true);
            # a miss must not splice - array_splice() coerces false to 0 and
            # would silently remove the first row
            if ($index !== false) {
                array_splice($this->index, $index, 1);
                array_splice($this->deque, $index, 1);
            }
        } else {
            $by_id[$id] = &$item;
            if ($this->max_size && (count($this->deque) === $this->max_size)) {
                $delete_item = array_shift($this->deque);
                array_shift($this->index);
                unset($this->hashmap[$this->as_string($delete_item[$this->key_field])][$this->as_string($delete_item['id'])]);
            }
        }
        # this allows us to effectively pass by reference
        $this->deque[] = &$item;
        $this->index[] = $this->index_key($key, $id);
        if ($this->clear_all_updates) {
            $this->clear_all_updates = false;
            $this->clear_updates_by_symbol = array();
            $this->all_new_updates = 0;
            $this->new_updates_by_symbol = array();
        }
        if (!array_key_exists($key, $this->new_updates_by_symbol)) {
            $this->new_updates_by_symbol[$key] = array();
        }
        if ($this->clear_updates_by_symbol[$key] ?? false) {
            $this->clear_updates_by_symbol[$key] = false;
            $this->new_updates_by_symbol[$key] = array();
        }
        $id_set = &$this->new_updates_by_symbol[$key];
        $before_length = count($id_set);
        $id_set[$id] = 1;
        $after_length = count($id_set);
        $this->all_new_updates = ($this->all_new_updates ?? 0) + ($after_length - $before_length);
    }

    public function clear() {
        # ArrayCache::clear() wipes the deque, the hashmap and the new-updates
        # bookkeeping, the positional index has to go with them or it desyncs
        parent::clear();
        $this->index = array();
    }
}
