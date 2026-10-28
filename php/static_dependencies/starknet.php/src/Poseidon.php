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
use phpseclib\Math\BigInteger;

class Poseidon
{
    const RATE = 2;
    const CAPACITY = 1;
    const ROUNDS_FULL = 8;
    const ROUNDS_PARTIAL = 83;

    private static $fieldPrime = null;
    private static $roundConstants = null;
    private static $mds = null;

    // the permutation runs on raw GMP values; BigInteger is only used at the public boundary
    private static function fieldPrime()
    {
        if (self::$fieldPrime === null) {
            self::$fieldPrime = gmp_init(Constants::FIELD_PRIME, 16);
        }
        return self::$fieldPrime;
    }

    private static function field($value)
    {
        // gmp_mod always returns a non-negative remainder
        return gmp_mod($value, self::fieldPrime());
    }

    private static function toGmp($value)
    {
        if ($value instanceof \GMP) {
            return $value;
        }
        return gmp_init(Utils::toBn($value)->toString(), 10);
    }

    private static function roundConstant($name, $index)
    {
        return self::field(gmp_init(hash('sha256', $name . (string) $index), 16));
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
        return gmp_powm($value, 3, self::fieldPrime());
    }

    private static function poseidonRound($values, $isFull, $index)
    {
        $roundConstants = self::roundConstants();
        $prime = self::fieldPrime();
        $count = count($values);
        for ($i = 0; $i < $count; $i++) {
            $values[$i] = gmp_mod(gmp_add($values[$i], $roundConstants[$index][$i]), $prime);
        }
        if ($isFull) {
            for ($i = 0; $i < $count; $i++) {
                $values[$i] = self::sbox($values[$i]);
            }
        } else {
            $last = $count - 1;
            $values[$last] = self::sbox($values[$last]);
        }
        $result = array();
        $mds = self::mds();
        foreach ($mds as $row) {
            $acc = gmp_init(0);
            for ($i = 0; $i < $count; $i++) {
                $acc = gmp_add($acc, gmp_mul($row[$i], $values[$i]));
            }
            $result[] = gmp_mod($acc, $prime);
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
            gmp_init(0),
            gmp_init(0),
            gmp_init(0)
        );
        
        for ($i = 0; $i < count($padded); $i += self::RATE) {
            for ($j = 0; $j < self::RATE; $j++) {
                $state[$j] = gmp_add($state[$j], self::toGmp($padded[$i + $j]));
            }
            $state = self::poseidonHash($state);
        }
        return new BigInteger(gmp_strval($state[0], 10), 10);
    }
}
