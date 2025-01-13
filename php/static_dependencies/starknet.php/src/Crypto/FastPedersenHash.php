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
use StarkNet\Crypto\Curve;
use StarkNet\Crypto\Hash;

class FastPedersenHash
{
    use Hash;
    
    // 2 ** 248 - 1
    public static function LOW_BITS_MASK()
    {
        return Utils::toBn('452312848583266388373324160190187140051835877600158453279131187530910662655');
    }

    /**
     * processSingleElement
     * 
     * @param BigNumber $element
     * @param Point $x
     * @param Point $y
     * @return Point
     */
    private static function processSingleElement($element, $p1, $p2)
    {
        $cmpZero = $element->compare(Constants::ZERO());
        assert($cmpZero >= 0 && $element->compare(Utils::toBn('0x' . Constants::FIELD_PRIME)) < 0, "Element value is out of range");
        $highNibble = $element->bitwise_rightShift(Constants::LOW_PART_BITS)->toHex();
        $lowPart = $element->bitwise_and(self::LOW_BITS_MASK())->toHex();
        if ($highNibble === '') {
            $highNibble = '0';
        }
        if ($lowPart === '') {
            $lowPart = '0';
        }
        return $p1->mul($lowPart)->add($p2->mul($highNibble));
    }

    /**
     * hash
     * pedersen hash
     * 
     * @param mixed $x
     * @param mixed $y
     * @return BigNumber pedersen hash of x and y
     */
    public static function hash($x, $y)
    {
        $xBn = Utils::toBn($x);
        $yBn = Utils::toBn($y);
        $points = Curve::constantPointsPedersen();
        $hashShiftPoint = $points[0];
        $p0 = $points[1];
        $p1 = $points[2];
        $p2 = $points[3];
        $p3 = $points[4];
        return ($hashShiftPoint->add(self::processSingleElement($xBn, $p0, $p1))->add(self::processSingleElement($yBn, $p2, $p3)))->getX();
    }
}