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
    }

    public function jsonSerialize() {
        return $this->getArrayCopy();
    }

    public function limit() {
        $this['asks']->limit();
        $this['bids']->limit();
        return $this;
    }

    public function update($nonce, $timestamp, $asks, $bids) {
        if ($nonce !== null && $this['nonce'] !== null && $nonce < $this['nonce']) {
            return $this;
        }
        foreach ($asks as $ask) {
            $this['asks']->storeArray($ask);
        }
        foreach ($bids as $bid) {
            $this['bid']->storeArray($bid);
        }
        $this['nonce'] = $nonce;
        $this['timestamp'] = $timestamp;
        $this['datetime'] = \ccxt\Exchange::iso8601($timestamp);
        return $this;
    }
}

// ----------------------------------------------------------------------------
// some exchanges limit the number of bids/asks in the aggregated orderbook
// orders beyond the limit threshold are not updated with new ws deltas
// those orders should not be returned to the user, they are outdated quickly

class LimitedOrderBook extends OrderBook {
    public function __construct($snapshot = array()) {
        $snapshot['asks'] = new LimitedAsks($snapshot['asks'] ? $snapshot['asks'] : array());
        $snapshot['bids'] = new LimitedBids($snapshot['bids'] ? $snapshot['bids'] : array());
        parent::__construct($snapshot);
    }
}


// ----------------------------------------------------------------------------
// overwrites absolute volumes at price levels
// or deletes price levels based on order counts (3rd value in a bidask delta)

class CountedOrderBook extends OrderBook {
    public function __construct($snapshot = array()) {
        $snapshot['asks'] = new CountedAsks($snapshot['asks'] ? $snapshot['asks'] : array());
        $snapshot['bids'] = new CountedBids($snapshot['bids'] ? $snapshot['bids'] : array());
        parent::__construct($snapshot);
    }
}

// ----------------------------------------------------------------------------
// indexed by order ids (3rd value in a bidask delta)

class IndexedOrderBook extends OrderBook {
    public function __construct($snapshot = array()) {
        $snapshot['asks'] = new IndexedAsks($snapshot['asks'] ? $snapshot['asks'] : array());
        $snapshot['bids'] = new IndexedBids($snapshot['bids'] ? $snapshot['bids'] : array());
        parent::__construct($snapshot);
    }
}

// ----------------------------------------------------------------------------
// adjusts the volumes by positive or negative relative changes or differences

class IncrementalOrderBook extends OrderBook {
    public function __construct($snapshot = array()) {
        $snapshot['asks'] = new IncrementalAsks($snapshot['asks'] ? $snapshot['asks'] : array());
        $snapshot['bids'] = new IncrementalBids($snapshot['bids'] ? $snapshot['bids'] : array());
        parent::__construct($snapshot);
    }
}

// ----------------------------------------------------------------------------
// limited and indexed (2 in 1)

class LimitedIndexedOrderBook extends OrderBook {
    public function __construct($snapshot = array()) {
        $snapshot['asks'] = new LimitedIndexedAsks($snapshot['asks'] ? $snapshot['asks'] : array());
        $snapshot['bids'] = new LimitedIndexedBids($snapshot['bids'] ? $snapshot['bids'] : array());
        parent::__construct($snapshot);
    }
}

// ----------------------------------------------------------------------------
// limited and indexed (2 in 1)

class LimitedCountedOrderBook extends OrderBook {
    public function __construct($snapshot = array()) {
        $snapshot['asks'] = new LimitedCountedAsks($snapshot['asks'] ? $snapshot['asks'] : array());
        $snapshot['bids'] = new LimitedCountedBids($snapshot['bids'] ? $snapshot['bids'] : array());
        parent::__construct($snapshot);
    }
}

// ----------------------------------------------------------------------------
// incremental and indexed (2 in 1)

class IncrementalIndexedOrderBook extends OrderBook {
    public function __construct($snapshot = array()) {
        $snapshot['asks'] = new IncrementalIndexedAsks($snapshot['asks'] ? $snapshot['asks'] : array());
        $snapshot['bids'] = new IncrementalIndexedBids($snapshot['bids'] ? $snapshot['bids'] : array());
        parent::__construct($snapshot);
    }
}
