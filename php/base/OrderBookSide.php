<?php
/**
 * Created by PhpStorm.
 * User: carlorevelli
 * Date: 2019-11-21
 * Time: 10:16
 **/

namespace ccxtpro;

use \Ds\Map;

class TruncatedIterator extends \ArrayIterator {
    public $length;

    public function __construct($array = array(), $flags = 0) {
        parent::__construct($array, $flags);
        $this->length = 10;
    }

    public function valid() {
        return $this->key() < $this->length;  // same shit we did in python just nicer api
    }
}

class OrderBookSide extends \ArrayObject implements \JsonSerializable {
    public $index;
    private $sequence;

    public function __construct($deltas = array()) {
        parent::__construct();
        $this->index = new Map();  // support for floating point keys
        if (count($deltas)) {
            $this->update($deltas);
        }
    }

    public function JsonSerialize () {
        return iterator_to_array($this->getIterator());
    }

    public function update($deltas) {
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

    public function store($price, $size) {
        if ($size) {
            $this->index->put($price, $size);
        } else {
            $this->index->remove($price, null);
        }
    }

    public function limit($n = null) {
        $this->index->ksort();
        $keys = $this->index->keys()->toArray();
        $values = $this->index->values()->toArray();
        if (true) {
            array_reverse($keys);
            array_reverse($values);
        }
        $result = array_map(null, $keys, $values);
        $this->exchangeArray($result);
        return $this;
    }

    public function getIterator() {
        return new TruncatedIterator($this->getArrayCopy());
    }
}
