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
    private $data;

    public function __construct($deltas = array()) {
        parent::__construct();
        $this->index = new Map();  // support for floating point keys
        $this->data = array();
        if (count($deltas)) {
            $this->update($deltas);
        }
    }

    public function JsonSerialize () {
        return $this->data;
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
            $this->index[$price] = $size;
        } else {
            $this->index->remove($price, null);
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
        $keys = $this->index->keys()->toArray();
        $values = $this->index->values()->toArray();
        if (true) {
            array_reverse($keys);
            array_reverse($values);
        }
        $this->data = array_map(null, $keys, $values);
        $this->exchangeArray($this->data);
        return $this;
    }

    public function getIterator() {
        return new \ArrayIterator($this->data);
    }
}


$x = new OrderBookSide([[1, 2], [3, 4], [5, 6]]);

for ($i = 0; $i < 100000; $i++) {
    $x->store($i, $i);
}

$start = microtime(1);

for ($i = 0; $i < 100000; $i++) {
    $x->store($i, 0);
}


$x->store(0, 0);
$x->store(0, 0);
$x->store(0, 0);


$end = microtime(1);

var_dump($end - $start);