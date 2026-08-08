<?php

/**
 * This file is part of starknet.php package.
 * 
 * (c) Kuan-Cheng,Lai <alk03073135@gmail.com>
 * 
 * @author Peter Lai <alk03073135@gmail.com>
 * @license MIT
 */

namespace StarkNet;

use StarkNet\Utils;
use StarkNet\Constants;

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
            self::$fieldPrime = Utils::toBn('0x' . Constants::FIELD_PRIME, 16);
        }
        return self::$fieldPrime;
    }

    private static function field($value)
    {
        if (!($value instanceof BigInteger)) {
            $value = Utils::toBn($value);
        }

        list(, $remainder) = $value->divide(self::fieldPrime());

        if ($remainder->is_negative) {
            $remainder = $remainder->add(self::fieldPrime());
        }

        return $remainder;
    }

    private static function roundConstant($name, $index)
    {
        return self::field(Utils::toBn('0x' . hash('sha256', $name . (string) $index)));
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
        $cube = $value->multiply($value)->multiply($value);
        return self::field($cube);
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
            $acc = Utils::toBn(0);
            for ($i = 0; $i < count($values); $i++) {
                $product = $row[$i]->multiply($values[$i]);
                $acc = $acc->add($product);
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
        
        $state = array(
            Utils::toBn(0),
            Utils::toBn(0),
            Utils::toBn(0)
        );
        
        for ($i = 0; $i < count($padded); $i += self::RATE) {
            for ($j = 0; $j < self::RATE; $j++) {
                $state[$j] = $state[$j]->add(Utils::toBn($padded[$i + $j]));
            }
            $state = self::poseidonHash($state);
        }
        return $state[0];
    }
}