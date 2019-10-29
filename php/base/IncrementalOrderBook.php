<?php

namespace ccxt;

class IncrementalOrderBook {
    public $orderBook;

    public function __construct($snapshot = null) {
        $this->orderBook = $snapshot === null ? array (
            'bids' => array (array (0, 0)),
            'asks' => array (array (PHP_INT_MAX, 0)),
            'timestamp' => null,
            'datetime' => null,
            'nonce' => null
        ) : $snapshot;
    }

    public function incrementOrderBook($nonce, $operation, $side, $price, $amount) {
        if ($this->orderBook['nonce'] !== null && $nonce <= $this->orderBook['nonce']) {
            return;
        }
        $bookSide = $this->orderBook[$side];
        for ($i = 0; $i < count($bookSide); $i++) {
            $order = $bookSide[$i];
            if ($side === "bids" ? $order[0] > $price : $order[0] <= $price) {
                continue;
            }
            if ($operation === 'delete') {
                array_splice($this->orderBook[$side], $i, 1);
                return;
            } else if ($operation == 'add') {
                if ($order[0] === $price) {
                    $order[1] += $amount;
                    $this->orderBook[$side][$i] = $order;
                    return;
                } else {
                    array_splice($this->orderBook[$side], $i, 0, array (array ($price, $amount)));
                    return;
                }
            } else if ($operation === 'absolute') {
                $this->orderBook[$side][$i][1] = $amount;
                return;
            }
        }
    }

    public function update($deltas) {
        foreach ($deltas as $d) {
            $this->incrementOrderBook(...$d);
        }
    }

    public function clean_abstraction($side) {
        if (end($this->orderBook[$side])[1] === 0) {
            array_pop($this->orderBook[$side]);
        }
    }
}
