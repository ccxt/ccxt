<?php

namespace ccxtpro;

use Iterator;

function bisectLeft($arr, $x) {
    $low = 0;
    $high = count($arr) - 1;
    while ($low <= $high) {
        $mid = intdiv(($low + $high), 2);
        if ($arr[$mid][0] - $x < 0) $low = $mid + 1;
        else $high = $mid - 1;
    }
    return $low;
}

const SIZE = 1024;
const tmp = array();

class OrderBookSide extends \ArrayObject implements \JsonSerializable {
    private $index;
    public $depth;
    public $n;

    public function __construct($deltas = array(), $depth = null) {
        parent::__construct();
        $this->depth = $depth ? $depth : PHP_INT_MAX;
        $this->n = PHP_INT_MAX;

        foreach ($deltas as $delta) {
            $this->storeArray($delta);
        }
    }

    public function storeArray($delta) {
        $price = $delta[0];
        $size = $delta[1];
        $index = bisectLeft($this, $price);
        if (static::side) {
            $index++;
        }
        if ($size) {
            if ($this->offsetExists($index)) {
                $tmp = $this->exchangeArray(tmp);
                array_splice($tmp, $index, 0, array($delta));
                $this->exchangeArray($tmp);
            } else {
                $this[$index] = $delta;
            }
        } else {
            $tmp = $this->exchangeArray(tmp);
            array_splice($tmp, $index, 1);
            $this->exchangeArray($tmp);
        }
    }

    public function store($price, $size, $id = null) {
        $this->storeArray(array($price, $size));
    }

    public function limit($n = null) {
        $this->n = $n ? $n : PHP_INT_MAX;
        $difference = count($this) - $this->depth;
        if ($difference) {
            $tmp = $this->exchangeArray(tmp);
            array_splice($tmp, -$difference);
            $this->exchangeArray($tmp);
        }
    }

    public function JsonSerialize () : array {
        return $this->getArrayCopy();
    }
}

// ----------------------------------------------------------------------------
// overwrites absolute volumes at price levels
// or deletes price levels based on order counts (3rd value in a bidask delta)

class CountedOrderBookSide extends OrderBookSide {
    public function __construct($deltas = array(), $depth = PHP_INT_MAX) {
        parent::__construct($deltas, $depth, LIMIT_BY_VALUE_PRICE_KEY);
    }

    public function store($price, $size, $count = null) {
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
    }}

// ----------------------------------------------------------------------------
// indexed by order ids (3rd value in a bidask delta)

class IndexedOrderBookSide extends OrderBookSide {
    public function __construct($deltas = array(), $depth = PHP_INT_MAX) {
        parent::__construct($deltas, $depth, LIMIT_BY_VALUE_INDEX_KEY);
    }

    public function store($price, $size, $id = null) {
        if ($size) {
            $stored = $this->index->get($id, null);
            if ($stored) {
                $price = $price ? $price : $stored[0];
            }
            $this->index->put($id, array($price, $size, $id));
        } else {
            $this->index->remove($id, null);
        }
    }

    public function storeArray($delta) {
        $price = $delta[0];
        $size = $delta[1];
        $id = $delta[2];
        if ($size) {
            $stored = $this->index->get($id, null);
            if ($stored) {
                $price = $price ? $price : $stored[0];
                $this->index->put($id, array($price, $size, $id));
                return;
            }
            $this->index->put($id, $delta);
        } else {
            $this->index->remove($id, null);
        }
    }
}

// ----------------------------------------------------------------------------
// a more elegant syntax is possible here, but native inheritance is portable

class Asks extends OrderBookSide { public static $side = false; }
class Bids extends OrderBookSide { public static $side = true; }
class CountedAsks extends CountedOrderBookSide { public static $side = false; }
class CountedBids extends CountedOrderBookSide { public static $side = true; }
class IndexedAsks extends IndexedOrderBookSide { public static $side = false; }
class IndexedBids extends IndexedOrderBookSide { public static $side = true; }

// ----------------------------------------------------------------------------
