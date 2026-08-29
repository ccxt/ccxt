<?php

/**
 * This file is part of web3.php package.
 * 
 * (c) Kuan-Cheng,Lai <alk03073135@gmail.com>
 * 
 * @author Peter Lai <alk03073135@gmail.com>
 * @license MIT
 */

namespace Web3\Formatters;

use InvalidArgumentException;
use Web3\Utils;
use Web3\Formatters\IFormatter;

class IntegerFormatter implements IFormatter
{
    /**
     * format
     * 
     * @param mixed $value
     * @return string
     */
    public static function format($value)
    {
        $value = (string) $value;
        $arguments = func_get_args();
        $digit = 64;

        if (isset($arguments[1]) && is_numeric($arguments[1])) {
            $digit = intval($arguments[1]);
        }
        $bn = Utils::toBn($value);
        $bnHex = $bn->toHex(true);
        $bnStr = $bn->toString();
        $bnHexLen = mb_strlen($bnHex);
        $padded = ($bnStr[0] === '-') ? 'f' : mb_substr($bnHex, 0, 1);

        if ($bnHexLen > $digit) {
            $zeroPos = 0;
            for ($i = 0; $i < $bnHexLen; $i++) {
                if ($bnHex[$i] !== '0') {
                    break;
                }
                $zeroPos += 1;
            }
            if ($zeroPos !== false) {
                $bnHex = mb_substr($bnHex, $zeroPos, $digit);
                $bnHexLen = mb_strlen($bnHex);
            }
            if ($bnHexLen >= $digit) {
                return mb_substr($bnHex, 0, $digit);
            }
        }
        if ($padded !== 'f') {
            $padded = '0';
        }
        return implode('', array_fill(0, $digit-mb_strlen($bnHex), $padded)) . $bnHex;
    }
}