<?php

namespace ccxtpro;

class OrderBook extends \ArrayObject implements \JsonSerializable {
    public $cache;

    public function __construct($snapshot = array(), $depth = null) {
        $this->cache = array();

        $depth = $depth ? $depth : PHP_INT_MAX;

        $defaults = array(
            'bids' => array(),
            'asks' => array(),
            'timestamp' => null,
            'datetime' => null,
            'nonce' => null,
        );
        parent::__construct(array_merge($defaults, $snapshot));
        if (!($this['asks'] instanceof OrderBookSide)) {
            $this['asks'] = new Asks($this['asks'], $depth);
        }
        if (!($this['bids'] instanceof OrderBookSide)) {
            $this['bids'] = new Bids($this['bids'], $depth);
        }
        $this['datetime'] = \ccxt\Exchange::iso8601($this['timestamp']);
    }

    public function jsonSerialize() {
        return $this->getArrayCopy();
    }

    public function limit($n = PHP_INT_MAX) {
        $this['asks']->limit($n);
        $this['bids']->limit($n);
        return $this;
    }

    public function reset($snapshot = array()) {
        $this['asks']->index->clear();
        if (array_key_exists('asks', $snapshot) && is_array($snapshot['asks'])) {
            foreach ($snapshot['asks'] as $delta) {
                $this['asks']->storeArray ($delta);
            }
        }
        $this['bids']->index->clear();
        if (array_key_exists('bids', $snapshot) && is_array($snapshot['bids'])) {
            foreach ($snapshot['bids'] as $delta) {
                $this['bids']->storeArray ($delta);
            }
        }
        @$this['nonce'] = $snapshot['nonce'];
        @$this['timestamp'] = $snapshot['timestamp'];
        $this['datetime'] = \ccxt\Exchange::iso8601($this['timestamp']);
    }

    public function update($snapshot) {
        $nonce = @$snapshot['nonce'];
        if ($nonce !== null && $this['nonce'] !== null && $nonce < $this['nonce']) {
            return $this;
        }
        return @$this->reset($snapshot);
    }
}

// ----------------------------------------------------------------------------
// overwrites absolute volumes at price levels
// or deletes price levels based on order counts (3rd value in a bidask delta)

class CountedOrderBook extends OrderBook {
    public function __construct($snapshot = array(), $depth = null) {
        $snapshot['asks'] = new CountedAsks(array_key_exists('asks', $snapshot) ? $snapshot['asks'] : array(), $depth);
        $snapshot['bids'] = new CountedBids(array_key_exists('bids', $snapshot) ? $snapshot['bids'] : array(), $depth);
        parent::__construct($snapshot);
    }
}

// ----------------------------------------------------------------------------
// indexed by order ids (3rd value in a bidask delta)

class IndexedOrderBook extends OrderBook {
    public function __construct($snapshot = array(), $depth = null) {
        $snapshot['asks'] = new IndexedAsks(array_key_exists('asks', $snapshot) ? $snapshot['asks'] : array(), $depth);
        $snapshot['bids'] = new IndexedBids(array_key_exists('bids', $snapshot) ? $snapshot['bids'] : array(), $depth);
        parent::__construct($snapshot);
    }
}

// ----------------------------------------------------------------------------
// adjusts the volumes by positive or negative relative changes or differences

class IncrementalOrderBook extends OrderBook {
    public function __construct($snapshot = array(), $depth = null) {
        $snapshot['asks'] = new IncrementalAsks(array_key_exists('asks', $snapshot) ? $snapshot['asks'] : array(), $depth);
        $snapshot['bids'] = new IncrementalBids(array_key_exists('bids', $snapshot) ? $snapshot['bids'] : array(), $depth);
        parent::__construct($snapshot);
    }
}

// ----------------------------------------------------------------------------
// incremental and indexed (2 in 1)

class IncrementalIndexedOrderBook extends OrderBook {
    public function __construct($snapshot = array(), $depth = null) {
        $snapshot['asks'] = new IncrementalIndexedAsks(array_key_exists('asks', $snapshot) ? $snapshot['asks'] : array(), $depth);
        $snapshot['bids'] = new IncrementalIndexedBids(array_key_exists('bids', $snapshot) ? $snapshot['bids'] : array(), $depth);
        parent::__construct($snapshot);
    }
}
