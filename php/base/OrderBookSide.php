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
    public static $side = null;

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
        if (static::$side) {
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
        if (static::$side) {
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

class LimitedOrderBookSide extends OrderBookSide {
    use Limited;
}

// ----------------------------------------------------------------------------
// overwrites absolute volumes at price levels
// or deletes price levels based on order counts (3rd value in a bidask delta)

trait Counted {
    public function store($price, $size, $count) {
        if ($size && $count) {
            $this->index[$price] = array($price, $size, $count);
        } else {
            unset($this->index[$price]);
        }
    }

    public function storeArray($delta) {
        $price = $delta[0];
        $size = $delta[1];
        $count = $delta[2];
        if ($count && $size) {
            $this->index[$price] = $delta;
        } else {
            unset($this->index[$price]);
        }
    }

    public function limit($n = null) {
        $this->index->ksort();
        if (static::$side) {
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

class CountedOrderBookSide extends OrderBookSide {
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
        if (static::$side) {
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
        $this->index[$price] = $this->index->get($price, 0) + $size;
        if ($this->index[$price] <= 0) {
            unset($this->index[$price]);
        }
    }

    public function storeArray($delta) {
        $price = $delta[0];
        $size = $delta[1];
        $this->index[$price] = $this->index->get($price, 0) + $size;
        if ($this->index[$price] <= 0) {
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
        if (static::$side) {
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

// ----------------------------------------------------------------------------
// limited and count-based

class LimitedCountedOrderBookSide extends CountedOrderBookSide {
    public $depth;
    use Counted;

    public function __construct($deltas = array(), $depth = null) {
        parent::__construct($deltas);
        $this->depth = $depth;
    }

    public function limit($n = null) {
        $this->index->sort();
        if (static::$side) {
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

// ----------------------------------------------------------------------------
// incremental and indexed (2 in 1)

class IncrementalIndexedOrderBookSide extends IndexedOrderBookSide {
    use Indexed;

    public function store($price, $size, $id) {
        if ($size) {
            $this->index[$id] = $this->index->get($id, 0) + $size;
            if ($this->index[$id] <= 0) {
                unset($this->index[$id]);
            }
        } else {
            unset($this->index[$id]);
        }
    }

    public function storeArray($delta) {
        $size = $delta[1];
        $id = $delta[2];
        if ($size) {
            $this->index[$id] = $this->index->get($id, 0) + $size;
            if ($this->index[$id] <= 0) {
                unset($this->index[$id]);
            }
        } else {
            unset($this->index[$id]);
        }
    }
}

// ----------------------------------------------------------------------------
// a more elegant syntax is possible here, but native inheritance is portable

class Asks extends OrderBookSide { public static $side = false; }
class Bids extends OrderBookSide { public static $side = true; }
class LimitedAsks extends LimitedOrderBookSide { public static $side = false; }
class LimitedBids extends LimitedOrderBookSide { public static $side = true; }
class CountedAsks extends CountedOrderBookSide { public static $side = false; }
class CountedBids extends CountedOrderBookSide { public static $side = true; }
class IndexedAsks extends IndexedOrderBookSide { public static $side = false; }
class IndexedBids extends IndexedOrderBookSide { public static $side = true; }
class IncrementalAsks extends IncrementalOrderBookSide { public static $side = false; }
class IncrementalBids extends IncrementalOrderBookSide { public static $side = true; }
class LimitedIndexedAsks extends LimitedIndexedOrderBookSide { public static $side = false; }
class LimitedIndexedBids extends LimitedIndexedOrderBookSide { public static $side = true; }
class LimitedCountedAsks extends LimitedCountedOrderBookSide { public static $side = false; }
class LimitedCountedBids extends LimitedCountedOrderBookSide { public static $side = true; }
class IncrementalIndexedAsks extends IncrementalIndexedOrderBookSide { public static $side = false; }
class IncrementalIndexedBids extends IncrementalIndexedOrderBookSide { public static $side = true; }

// ----------------------------------------------------------------------------