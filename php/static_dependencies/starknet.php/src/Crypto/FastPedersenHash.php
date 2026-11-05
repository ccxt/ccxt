<?php

/**
 * This file is part of starknet.php package.
 * 
 * (c) Kuan-Cheng,Lai <alk03073135@gmail.com>
 * 
 * @author Peter Lai <alk03073135@gmail.com>
 * @license MIT
 */

namespace StarkNet\Crypto;

use StarkNet\Constants;
use StarkNet\Utils;
use StarkNet\Crypto\Hash;
use BN\BN;

class FastPedersenHash
{
    use Hash;

    // affine STARK-curve arithmetic on raw GMP values (y^2 = x^3 + x + b over FIELD_PRIME);
    // the point at infinity is null. the four base points get a doubling table each so a
    // scalar multiplication is a plain double-and-add walk over precomputed points
    private static $prime = null;
    private static $lowBitsMask = null;
    private static $shiftPoint = null;
    private static $tables = null;
    private static $hashCache = [];
    
    // 2 ** 248 - 1
    public static function LOW_BITS_MASK()
    {
        return Utils::toBn('452312848583266388373324160190187140051835877600158453279131187530910662655');
    }

    private static function prime()
    {
        if (self::$prime === null) {
            self::$prime = gmp_init(Constants::FIELD_PRIME, 16);
            self::$lowBitsMask = gmp_sub(gmp_pow(2, Constants::LOW_PART_BITS), 1);
        }
        return self::$prime;
    }

    private static function pointAdd($a, $b)
    {
        if ($a === null) {
            return $b;
        }
        if ($b === null) {
            return $a;
        }
        $prime = self::prime();
        if (gmp_cmp($a[0], $b[0]) === 0) {
            if (gmp_cmp(gmp_mod(gmp_add($a[1], $b[1]), $prime), 0) === 0) {
                return null;
            }
            return self::pointDouble($a);
        }
        $lambda = gmp_mod(gmp_mul(gmp_sub($b[1], $a[1]), gmp_invert(gmp_sub($b[0], $a[0]), $prime)), $prime);
        $x = gmp_mod(gmp_sub(gmp_sub(gmp_mul($lambda, $lambda), $a[0]), $b[0]), $prime);
        $y = gmp_mod(gmp_sub(gmp_mul($lambda, gmp_sub($a[0], $x)), $a[1]), $prime);
        return array($x, $y);
    }

    private static function pointDouble($a)
    {
        $prime = self::prime();
        // curve coefficient a = ALPHA = 1
        $numerator = gmp_add(gmp_mul(3, gmp_mul($a[0], $a[0])), gmp_init(Constants::ALPHA, 16));
        $lambda = gmp_mod(gmp_mul($numerator, gmp_invert(gmp_mul(2, $a[1]), $prime)), $prime);
        $x = gmp_mod(gmp_sub(gmp_mul($lambda, $lambda), gmp_mul(2, $a[0])), $prime);
        $y = gmp_mod(gmp_sub(gmp_mul($lambda, gmp_sub($a[0], $x)), $a[1]), $prime);
        return array($x, $y);
    }

    private static function doublingTable($point, $bits)
    {
        $table = array($point);
        for ($i = 1; $i < $bits; $i++) {
            $point = self::pointDouble($point);
            $table[] = $point;
        }
        return $table;
    }

    private static function tables()
    {
        if (self::$tables === null) {
            $raw = Constants::CONSTANT_POINTS;
            $point = function ($index) use ($raw) {
                return array(gmp_init($raw[$index][0], 16), gmp_init($raw[$index][1], 16));
            };
            $low = Constants::LOW_PART_BITS;
            $high = Constants::N_ELEMENT_BITS_HASH - Constants::LOW_PART_BITS;
            self::$shiftPoint = $point(0);
            self::$tables = array(
                self::doublingTable($point(2), $low),
                self::doublingTable($point(2 + Constants::LOW_PART_BITS), $high),
                self::doublingTable($point(2 + Constants::N_ELEMENT_BITS_HASH), $low),
                self::doublingTable($point(2 + Constants::N_ELEMENT_BITS_HASH + Constants::LOW_PART_BITS), $high),
            );
        }
        return self::$tables;
    }

    private static function mulTable($scalar, $table)
    {
        $acc = null;
        $bits = gmp_strval($scalar, 2);
        $length = strlen($bits);
        for ($i = 0; $i < $length; $i++) {
            if ($bits[$length - 1 - $i] === '1') {
                $acc = self::pointAdd($acc, $table[$i]);
            }
        }
        return $acc;
    }

    /**
     * processSingleElement
     * 
     * @param GMP $element
     * @param array $lowTable
     * @param array $highTable
     * @return array|null point
     */
    private static function processSingleElement($element, $lowTable, $highTable)
    {
        assert(gmp_cmp($element, 0) >= 0 && gmp_cmp($element, self::prime()) < 0, "Element value is out of range");
        $highNibble = gmp_div_q($element, gmp_pow(2, Constants::LOW_PART_BITS));
        $lowPart = gmp_and($element, self::$lowBitsMask);
        $result = null;
        if (gmp_cmp($lowPart, 0) > 0) {
            $result = self::mulTable($lowPart, $lowTable);
        }
        if (gmp_cmp($highNibble, 0) > 0) {
            $result = self::pointAdd($result, self::mulTable($highNibble, $highTable));
        }
        return $result;
    }

    /**
     * hash
     * pedersen hash
     * 
     * @param mixed $x
     * @param mixed $y
     * @return BN pedersen hash of x and y
     */
    public static function hash($x, $y)
    {
        $xGmp = gmp_init(Utils::toBn($x)->toString(), 10);
        $yGmp = gmp_init(Utils::toBn($y)->toString(), 10);
        // pedersen is a pure function of (x, y) and the same pairs recur across a session
        // (domain and type hashes), so memoize the field element per process
        $cacheKey = gmp_strval($xGmp, 16) . ':' . gmp_strval($yGmp, 16);
        if (!isset(self::$hashCache[$cacheKey])) {
            self::prime();
            $tables = self::tables();
            $point = self::pointAdd(self::$shiftPoint, self::processSingleElement($xGmp, $tables[0], $tables[1]));
            $point = self::pointAdd($point, self::processSingleElement($yGmp, $tables[2], $tables[3]));
            self::$hashCache[$cacheKey] = gmp_strval($point[0], 16);
        }
        return new BN(self::$hashCache[$cacheKey], 16);
    }
}
