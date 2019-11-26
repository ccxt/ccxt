<?php
/**
 * Created by PhpStorm.
 * User: carlorevelli
 * Date: 2019-11-21
 * Time: 10:16
 **/

namespace ccxtpro;

use \Ds\Map;

class OrderBookSide extends \ArrayObject implements \JsonSerializable {
    public $index;

    public function __construct($deltas = array()) {
        parent::__construct();
        $this->index = new Map();  // support for floating point keys
        $this->data = array();
        foreach ($deltas as $delta) {
            $this->storeArray($delta);
        }
    }

    public function storeArray($delta) {
        $price = $delta[0];
        $size = $delta[1];
        if ($size) {
            $this->index[$price] = $size;
        } else {
            unset($this->index[$price]);
        }
    }

    public function store($price, $size) {
        if ($size) {
            $this->index[$price] = $size;
        } else {
            unset($this->index[$price]);
        }
    }

    public function limit($n = null) {
        $this->index->ksort();
        if (true) {
            $this->index->reverse();
        }
        $keys = $this->index->keys()->toArray();
        $values = $this->index->values()->toArray();
        if ($n) {
            array_splice($keys, $n);
            array_splice($values, $n);
        }
        $result = array_map(null, $keys, $values);
        $this->exchangeArray($result);
        return $this;
    }

    public function getIterator() {
        return new \ArrayIterator($this->getArrayCopy());
    }

    public function JsonSerialize () {
        return $this->getArrayCopy();
    }
}

// ----------------------------------------------------------------------------
// some exchanges limit the number of bids/asks in the aggregated orderbook
// orders beyond the limit threshold are not updated with new ws deltas
// those orders should not be returned to the user, they are outdated quickly

trait Limited {
    public $depth;

    public function __construct($deltas = array(), $depth = null) {
        parent::__construct($deltas);
        $this->depth = $depth;
    }

    public function limit($n = null) {
        $this->index->ksort();
        if (true) {
            $this->index->reverse();
        }
        $keys = $this->index->keys()->toArray();
        $values = $this->index->values()->toArray();
        if ($n || $this->depth) {
            $limit = min($n ? $n : PHP_INT_MAX, $this->depth ? $this->depth : PHP_INT_MAX);
            array_splice($keys, $limit);
            array_splice($values, $limit);
        }
        $result = array_map(null, $keys, $values);
        $this->index->clear();
        foreach ($result as $key => $value) {
            $this->index[$key] = $value;
        }
        $this->exchangeArray($result);
        return $this;
    }
}

class LimitedOrderBook extends OrderBookSide {
    use Limited;
}

// ----------------------------------------------------------------------------
// overwrites absolute volumes at price levels
// or deletes price levels based on order counts (3rd value in a bidask delta)

trait Counted {
    public function store($price, $size, $count) {
        if ($count && $size) {
            $this->index[$price] = array($price, $size, $count);
        } else {
            unset($this->index[$price]);
        }
    }

    public function storeArray($delta) {
        $price = $delta[0];
        $size = $delta[1];
        $count = $delta[3];
        if ($count && $size) {
            $this->index[$price] = $delta;
        } else {
            unset($this->index[$price]);
        }
    }

    public function limit($n = null) {
        $this->index->sort();
        if (false) {
            $this->index->reverse();
        }
        $values = $this->index->values()->toArray();
        if ($n) {
            array_splice($values, $n);
        }
        $this->exchangeArray($values);
        return $this;
    }
}

class CountedOrderBook extends OrderBookSide {
    use Counted;
}

// ----------------------------------------------------------------------------
// indexed by order ids (3rd value in a bidask delta)

trait Indexed {
    public function store($price, $size, $id) {
        if ($size) {
            $this->index[$id] = [$price, $size, $id];
        } else {
            unset($this->index[$id]);
        }
    }

    public function storeArray($delta) {
        $size = $delta[1];
        $id = $delta[2];
        if ($size) {
            $this->index[$id] = $delta;
        } else {
            unset($this->index[$id]);
        }
    }

    public function limit($n = null) {
        $this->index->sort();
        if (false) {
            $this->index->reverse();
        }
        $values = $this->index->values()->toArray();
        if ($n) {
            array_splice($values, $n);
        }
        $this->exchangeArray($values);
        return $this;
    }
}

class IndexedOrderBookSide extends OrderBookSide {
    use Indexed;
}

// ----------------------------------------------------------------------------
// adjusts the volumes by positive or negative relative changes or differences

class IncrementalOrderBookSide extends OrderBookSide {
    public function store($price, $size) {
        if ($size) {
            $this->index[$price] = $this->index->get($price, 0) + $size;
            if ($this->index[$price] <= 0) {
                unset($this->index[$price]);
            }
        } else {
            unset($this->index[$price]);
        }
    }
}

// ----------------------------------------------------------------------------
// limited and order-id-based


class LimitedIndexedOrderBookSide extends OrderBookSide {
    public $depth;
    use Indexed;

    public function __construct($deltas = array(), $depth = null) {
        parent::__construct($deltas);
        $this->depth = $depth;
    }

    public function limit($n = null) {
        $this->index->sort();
        if (false) {
            $this->index->reverse();
        }
        $keys = $this->index->keys()->toArray();
        $values = $this->index->values()->toArray();
        if ($n || $this->depth) {
            $limit = min($n ? $n : PHP_INT_MAX, $this->depth ? $this->depth : PHP_INT_MAX);
            array_splice($values, $limit);
        }
        $this->index->clear();
        foreach ($values as $value) {
            $this->index[next($keys)] = $value;
        }
        $this->exchangeArray($values);
        return $this;
    }
}
