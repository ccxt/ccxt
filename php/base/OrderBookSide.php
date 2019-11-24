<?php
/**
 * Created by PhpStorm.
 * User: carlorevelli
 * Date: 2019-11-21
 * Time: 10:16
 **/

namespace ccxtpro;

use \Ds\Map;

class OrderBookSide extends \ArrayIterator implements \JsonSerializable {
    public $length;
    private $index;

    public function __construct($array = array(), $flags = 0) {
        $this->index = new Map();  // support for floating point keys
        $this->length = count($array);
        parent::__construct($array, $flags);
    }

    public function valid() {
        return $this->key() < $this->length;  // same shit we did in python just nicer api
    }

    public function JsonSerialize () {
        return iterator_to_array($this);
    }
}

