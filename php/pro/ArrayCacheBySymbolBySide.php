<?php

namespace ccxt\pro;

class ArrayCacheBySymbolBySide extends ArrayCache {
    public $hashmap;
    private $index;

    // $max_size is accepted for constructor compatibility but deliberately
    // unused - the typescript source builds this cache without a maxSize
    // (Cache.ts), so positions are never evicted; the key space is bounded
    // by symbol x side and rows are replaced in place
    public function __construct($max_size = null) {
        parent::__construct($max_size);
        $this->nested_new_updates_by_symbol = true;
        $this->hashmap = array();
        $this->index = array();
    }

    public function append($item) {
        $symbol = $this->as_string($item['symbol']);
        $side = $this->as_string($item['side']);
        if (array_key_exists($symbol, $this->hashmap)) {
            $by_side = &$this->hashmap[$symbol];
        } else {
            $by_side = array();
            $this->hashmap[$symbol] = &$by_side;
        }
        if (array_key_exists($side, $by_side)) {
            $prev_ref = &$by_side[$side];
            # field-wise merge, mirroring `for (const prop in item)` in the
            # typescript source - a partial position delta must not drop the
            # entryPrice, notional, leverage ... it does not mention
            foreach ($item as $prop => $value) {
                $prev_ref[$prop] = $value;
            }
            $item = &$prev_ref;
            # match the (symbol, side) PAIR strictly - a plainly concatenated
            # key is ambiguous, so the symbol is length prefixed, which makes
            # the encoding injective and cannot splice the wrong position out
            $index = array_search($this->index_key($symbol, $side), $this->index, true);
            # a miss must not splice - array_splice() coerces false to 0 and
            # would silently remove the first row
            if ($index !== false) {
                array_splice($this->index, $index, 1);
                array_splice($this->deque, $index, 1);
            }
        } else {
            $by_side[$side] = &$item;
        }
        # this allows us to effectively pass by reference
        $this->deque[] = &$item;
        $this->index[] = $this->index_key($symbol, $side);
        if ($this->clear_all_updates) {
            $this->clear_all_updates = false;
            # the global poll consumes only the global scope: the symbol-scoped
            # seen sets, counts and pending flags belong to the symbol consumers
            $this->all_new_updates = 0;
            $this->seen_updates_all = array();
        }
        # the DISTINCT sides seen for this symbol live in their own map - the
        # count they produce is what $new_updates_by_symbol carries, so
        # getLimit() only ever reads an integer
        if (!array_key_exists($symbol, $this->seen_updates_by_symbol)) {
            $this->seen_updates_by_symbol[$symbol] = array();
        }
        if ($this->clear_updates_by_symbol[$symbol] ?? false) {
            $this->clear_updates_by_symbol[$symbol] = false;
            $this->seen_updates_by_symbol[$symbol] = array();
        }
        # in case an exchange re-sends the same side twice
        $this->seen_updates_by_symbol[$symbol][$side] = true;
        $this->new_updates_by_symbol[$symbol] = count($this->seen_updates_by_symbol[$symbol]);
        # the global scope keeps its own seen sets: the symbol-scoped poll clears
        # the symbol set, and deriving the global count from that set double-counts
        # an entry that updates again after a symbol poll
        if (!array_key_exists($symbol, $this->seen_updates_all)) {
            $this->seen_updates_all[$symbol] = array();
        }
        $before_all_length = count($this->seen_updates_all[$symbol]);
        $this->seen_updates_all[$symbol][$side] = true;
        $after_all_length = count($this->seen_updates_all[$symbol]);
        $this->all_new_updates = ($this->all_new_updates ?? 0) + ($after_all_length - $before_all_length);
    }

    public function clear() {
        # ArrayCache::clear() wipes the deque, the hashmap and the new-updates
        # bookkeeping, the positional index has to go with them or it desyncs
        parent::clear();
        $this->index = array();
    }
}
