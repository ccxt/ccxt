<?php

namespace ccxtpro;

class OrderBook extends \ArrayObject implements \JsonSerializable {
    public function __construct($snapshot = array()) {
        $defaults = array(
            'bids' => array(),
            'asks' => array(),
            'timestamp' => null,
            'datetime' => null,
            'nonce' => null,
        );
        parent::__construct(array_merge($defaults, $snapshot));
        if (!is_object($this['asks'])) {
            $this['asks'] = new Asks($this['asks']);
        }
        if (!is_object($this['bids'])) {
            $this['bids'] = new Bids($this['bids']);
        }
        if ($this['timestamp']) {
            $this['datetime'] = \ccxt\Exchange::iso8601($this['timestamp']);
        }
    }

    public function jsonSerialize() {
        return $this->getArrayCopy();
    }

    public function limit() {
        $this['asks']->limit();
        $this['bids']->limit();
        return $this;
    }

    public function reset($nonce, $timestamp, &$asks, &$bids) {
        $this['asks']->update($asks);
        $this['bids']->update($bids);
        $this['nonce'] = $nonce;
        $this['timestamp'] = $timestamp;
        $this['datetime'] = \ccxt\Exchange::iso8601($timestamp);
    }

    public function update($snapshot) {
        $nonce = @$snapshot['nonce'];
        if ($nonce !== null && $this['nonce'] !== null && $nonce < $this['nonce']) {
            return $this;
        }
        $timestamp = @$snapshot['timestamp'];
        return @$this->reset($nonce, $timestamp, $snapshot['asks'], $snapshot['bids']);
    }
}

// ----------------------------------------------------------------------------
// some exchanges limit the number of bids/asks in the aggregated orderbook
// orders beyond the limit threshold are not updated with new ws deltas
// those orders should not be returned to the user, they are outdated quickly

class LimitedOrderBook extends OrderBook {
    public function __construct($snapshot = array(), $depth = null) {
        $snapshot['asks'] = new LimitedAsks(array_key_exists('asks', $snapshot) ? $snapshot['asks'] : array(), $depth);
        $snapshot['bids'] = new LimitedBids(array_key_exists('bids', $snapshot) ? $snapshot['bids'] : array(), $depth);
        parent::__construct($snapshot);
    }
}


// ----------------------------------------------------------------------------
// overwrites absolute volumes at price levels
// or deletes price levels based on order counts (3rd value in a bidask delta)

class CountedOrderBook extends OrderBook {
    public function __construct($snapshot = array()) {
        $snapshot['asks'] = new CountedAsks(array_key_exists('asks', $snapshot) ? $snapshot['asks'] : array());
        $snapshot['bids'] = new CountedBids(array_key_exists('bids', $snapshot) ? $snapshot['bids'] : array());
        parent::__construct($snapshot);
    }
}

// ----------------------------------------------------------------------------
// indexed by order ids (3rd value in a bidask delta)

class IndexedOrderBook extends OrderBook {
    public function __construct($snapshot = array()) {
        $snapshot['asks'] = new IndexedAsks(array_key_exists('asks', $snapshot) ? $snapshot['asks'] : array());
        $snapshot['bids'] = new IndexedBids(array_key_exists('bids', $snapshot) ? $snapshot['bids'] : array());
        parent::__construct($snapshot);
    }
}

// ----------------------------------------------------------------------------
// adjusts the volumes by positive or negative relative changes or differences

class IncrementalOrderBook extends OrderBook {
    public function __construct($snapshot = array()) {
        $snapshot['asks'] = new IncrementalAsks(array_key_exists('asks', $snapshot) ? $snapshot['asks'] : array());
        $snapshot['bids'] = new IncrementalBids(array_key_exists('bids', $snapshot) ? $snapshot['bids'] : array());
        parent::__construct($snapshot);
    }
}

// ----------------------------------------------------------------------------
// limited and indexed (2 in 1)

class LimitedIndexedOrderBook extends OrderBook {
    public function __construct($snapshot = array(), $depth = null) {
        $snapshot['asks'] = new LimitedIndexedAsks(array_key_exists('asks', $snapshot) ? $snapshot['asks'] : array(), $depth);
        $snapshot['bids'] = new LimitedIndexedBids(array_key_exists('bids', $snapshot) ? $snapshot['bids'] : array(), $depth);
        parent::__construct($snapshot);
    }
}

// ----------------------------------------------------------------------------
// limited and indexed (2 in 1)

class LimitedCountedOrderBook extends OrderBook {
    public function __construct($snapshot = array()) {
        $snapshot['asks'] = new LimitedCountedAsks(array_key_exists('asks', $snapshot) ? $snapshot['asks'] : array());
        $snapshot['bids'] = new LimitedCountedBids(array_key_exists('bids', $snapshot) ? $snapshot['bids'] : array());
        parent::__construct($snapshot);
    }
}

// ----------------------------------------------------------------------------
// incremental and indexed (2 in 1)

class IncrementalIndexedOrderBook extends OrderBook {
    public function __construct($snapshot = array()) {
        $snapshot['asks'] = new IncrementalIndexedAsks(array_key_exists('asks', $snapshot) ? $snapshot['asks'] : array());
        $snapshot['bids'] = new IncrementalIndexedBids(array_key_exists('bids', $snapshot) ? $snapshot['bids'] : array());
        parent::__construct($snapshot);
    }
}
