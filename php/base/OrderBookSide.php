<?php

namespace ccxtpro;

use \Ds\Map;

const LIMIT_BY_KEY = 0;
const LIMIT_BY_VALUE_PRICE_KEY = 1;
const LIMIT_BY_VALUE_INDEX_KEY = 2;

class OrderBookSide extends \ArrayObject implements \JsonSerializable {
    public $index;
    public $depth;
    public $limit_type;
    public static $side = null;

    public function __construct($deltas = array(), $depth = PHP_INT_MAX, $limit_type = LIMIT_BY_KEY) {
        parent::__construct();
        $this->index = new Map();  // support for floating point keys
        $this->depth = $depth ? $depth : PHP_INT_MAX;
        $this->limit_type = $limit_type;
        foreach ($deltas as $delta) {
            $this->storeArray($delta);
        }
    }

    public function storeArray($delta) {
        $price = $delta[0];
        $size = $delta[1];
        if ($size) {
            $this->index->put($price, $size);
        } else {
            $this->index->remove($price, null);
        }
    }

    public function store($price, $size, $id = null) {
        if ($size) {
            $this->index->put($price, $size);
        } else {
            $this->index->remove($price, null);
        }
    }

    public function limit($n = null) {
        $n = $n ? $n : PHP_INT_MAX;
        if ($this->limit_type) {
            $this->index->sort();
        } else {
            $this->index->ksort();
        }
        if (static::$side) {
            $this->index->reverse();
        }
        if ($this->limit_type) {
            $array = $this->index->values()->toArray();
        } else {
            $array = [];
            foreach ($this->index as $key => $value) {
                $array[] = array($key, $value);
            }
        }
        $threshold = min($this->depth, count($array));
        $this->exchangeArray(array());
        $this->index->clear();
        for ($i = 0; $i < $threshold; $i++) {
            $current = $array[$i];
            $price = $current[0];
            if ($this->limit_type) {
                $last = $current[2];
                if ($this->limit_type === LIMIT_BY_VALUE_PRICE_KEY) {
                    $this->index->put($price, $current);
                } else {
                    $this->index->put($last, $current);
                }
            } else {
                $size = $current[1];
                $this->index->put($price, $size);
            }
            if ($i < $n) {
                $this->append($current);
            }
        }
        return $this;
    }

    public function JsonSerialize () {
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
// adjusts the volumes by positive or negative relative changes or differences

class IncrementalOrderBookSide extends OrderBookSide {
    public function __construct($deltas = array(), $depth = PHP_INT_MAX) {
        parent::__construct($deltas, $depth, LIMIT_BY_KEY);
    }

    public function store($price, $size, $id = null) {
        $size = $this->index->get($price, 0) + $size;
        if ($size <= 0) {
            $this->index->remove($price, null);
        } else {
            $this->index->put($price, $size);
        }
    }

    public function storeArray($delta) {
        $price = $delta[0];
        $size = $delta[1];
        $size = $this->index->get($price, 0) + $size;
        if ($size <= 0) {
            $this->index->remove($price, null);
        } else {
            $this->index->put($price, $size);
        }
    }
}

// ----------------------------------------------------------------------------
// incremental and indexed (2 in 1)

class IncrementalIndexedOrderBookSide extends IndexedOrderBookSide {
    public function store($price, $size, $id = null) {
        if ($size) {
            $stored = $this->index->get($id, null);
            if ($stored) {
                if ($size + $stored[1] >= 0) {
                    $price = $price ? $price : $stored[0];
                    $size = $size + $stored[1];
                }
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
                if ($size + $stored[1] >= 0) {
                    $price = $price ? $price : $stored[0];
                    $size = $size + $stored[1];
                    $this->index->put($id, array($price, $size, $id));
                    return;
                }
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
class IncrementalAsks extends IncrementalOrderBookSide { public static $side = false; }
class IncrementalBids extends IncrementalOrderBookSide { public static $side = true; }
class IncrementalIndexedAsks extends IncrementalIndexedOrderBookSide { public static $side = false; }
class IncrementalIndexedBids extends IncrementalIndexedOrderBookSide { public static $side = true; }

// ----------------------------------------------------------------------------
