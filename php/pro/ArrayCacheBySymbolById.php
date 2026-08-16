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
                $delete_key = $this->as_string($delete_item[$this->key_field]);
                unset($this->hashmap[$delete_key][$this->as_string($delete_item['id'])]);
                # drop the outer bucket once its last id is evicted, otherwise the
                # hashmap grows one empty array per key for the process lifetime
                if (!count($this->hashmap[$delete_key])) {
                    unset($this->hashmap[$delete_key]);
                }
            }
        }
        # this allows us to effectively pass by reference
        $this->deque[] = &$item;
        $this->index[] = $this->index_key($key, $id);
        if ($this->clear_all_updates) {
            $this->clear_all_updates = false;
            # the global poll consumes only the global scope: the symbol-scoped
            # seen sets, counts and pending flags belong to the symbol consumers
            $this->all_new_updates = 0;
            $this->seen_updates_all = array();
        }
        # the DISTINCT ids seen for this key live in their own map - the count
        # they produce is what $new_updates_by_symbol carries, so getLimit()
        # only ever reads an integer
        if (!array_key_exists($key, $this->seen_updates_by_symbol)) {
            $this->seen_updates_by_symbol[$key] = array();
        }
        if ($this->clear_updates_by_symbol[$key] ?? false) {
            $this->clear_updates_by_symbol[$key] = false;
            $this->seen_updates_by_symbol[$key] = array();
        }
        # in case an exchange updates the same order id twice
        $this->seen_updates_by_symbol[$key][$id] = true;
        $this->new_updates_by_symbol[$key] = count($this->seen_updates_by_symbol[$key]);
        # the global scope keeps its own seen sets: the symbol-scoped poll clears
        # the symbol set, and deriving the global count from that set double-counts
        # an entry that updates again after a symbol poll
        if (!array_key_exists($key, $this->seen_updates_all)) {
            $this->seen_updates_all[$key] = array();
        }
        $before_all_length = count($this->seen_updates_all[$key]);
        $this->seen_updates_all[$key][$id] = true;
        $after_all_length = count($this->seen_updates_all[$key]);
        $this->all_new_updates = ($this->all_new_updates ?? 0) + ($after_all_length - $before_all_length);
    }

    public function clear() {
        # ArrayCache::clear() wipes the deque, the hashmap and the new-updates
        # bookkeeping, the positional index has to go with them or it desyncs
        parent::clear();
        $this->index = array();
    }
}
