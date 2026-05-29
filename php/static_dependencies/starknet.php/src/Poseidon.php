<?php

namespace StarkNet;

use BN\BN;

class Poseidon
{
    const RATE = 2;
    const CAPACITY = 1;
    const ROUNDS_FULL = 8;
    const ROUNDS_PARTIAL = 83;

    private static $fieldPrime = null;
    private static $roundConstants = null;
    private static $mds = null;

    private static function fieldPrime()
    {
        if (self::$fieldPrime === null) {
            self::$fieldPrime = new BN(Constants::FIELD_PRIME, 16);
        }
        return self::$fieldPrime;
    }

    private static function field($value)
    {
        if (!($value instanceof BN)) {
            $value = self::toBn($value);
        }
        return $value->umod(self::fieldPrime());
    }

    private static function toBn($value)
    {
        if ($value instanceof BN) {
            return $value;
        }
        if (is_int($value)) {
            return new BN((string) $value, 10);
        }
        if (is_string($value)) {
            if (substr($value, 0, 2) === '0x') {
                return new BN(substr($value, 2), 16);
            }
            return new BN($value, 10);
        }
        return new BN((string) $value, 10);
    }

    private static function roundConstant($name, $index)
    {
        return self::field(new BN(hash('sha256', $name . (string) $index), 16));
    }

    private static function roundConstants()
    {
        if (self::$roundConstants === null) {
            self::$roundConstants = array();
            $rounds = self::ROUNDS_FULL + self::ROUNDS_PARTIAL;
            $width = self::RATE + self::CAPACITY;
            for ($i = 0; $i < $rounds; $i++) {
                $row = array();
                for ($j = 0; $j < $width; $j++) {
                    $row[] = self::roundConstant('Hades', $width * $i + $j);
                }
                self::$roundConstants[] = $row;
            }
        }
        return self::$roundConstants;
    }

    private static function mds()
    {
        if (self::$mds === null) {
            self::$mds = array(
                array(self::field(3), self::field(1), self::field(1)),
                array(self::field(1), self::field(-1), self::field(1)),
                array(self::field(1), self::field(1), self::field(-2)),
            );
        }
        return self::$mds;
    }

    private static function sbox($value)
    {
        return $value->mul($value)->mul($value)->umod(self::fieldPrime());
    }

    private static function poseidonRound($values, $isFull, $index)
    {
        $roundConstants = self::roundConstants();
        for ($i = 0; $i < count($values); $i++) {
            $values[$i] = self::field($values[$i]->add($roundConstants[$index][$i]));
        }
        if ($isFull) {
            for ($i = 0; $i < count($values); $i++) {
                $values[$i] = self::sbox($values[$i]);
            }
        } else {
            $last = count($values) - 1;
            $values[$last] = self::sbox($values[$last]);
        }
        $result = array();
        $mds = self::mds();
        foreach ($mds as $row) {
            $acc = new BN('0', 10);
            for ($i = 0; $i < count($values); $i++) {
                $acc = $acc->add($row[$i]->mul($values[$i]));
            }
            $result[] = self::field($acc);
        }
        return $result;
    }

    private static function poseidonHash($values)
    {
        $width = self::RATE + self::CAPACITY;
        if (count($values) !== $width) {
            throw new \InvalidArgumentException('Poseidon: wrong values length');
        }
        for ($i = 0; $i < count($values); $i++) {
            $values[$i] = self::field($values[$i]);
        }
        $roundIndex = 0;
        $halfRoundsFull = intval(self::ROUNDS_FULL / 2);
        for ($i = 0; $i < $halfRoundsFull; $i++) {
            $values = self::poseidonRound($values, true, $roundIndex);
            $roundIndex++;
        }
        for ($i = 0; $i < self::ROUNDS_PARTIAL; $i++) {
            $values = self::poseidonRound($values, false, $roundIndex);
            $roundIndex++;
        }
        for ($i = 0; $i < $halfRoundsFull; $i++) {
            $values = self::poseidonRound($values, true, $roundIndex);
            $roundIndex++;
        }
        return $values;
    }

    public static function hashMany($values)
    {
        $padded = array_values($values);
        $padded[] = 1;
        while ((count($padded) % self::RATE) !== 0) {
            $padded[] = 0;
        }
        $state = array(new BN('0', 10), new BN('0', 10), new BN('0', 10));
        for ($i = 0; $i < count($padded); $i += self::RATE) {
            for ($j = 0; $j < self::RATE; $j++) {
                $state[$j] = $state[$j]->add(self::toBn($padded[$i + $j]));
            }
            $state = self::poseidonHash($state);
        }
        return $state[0];
    }
}
