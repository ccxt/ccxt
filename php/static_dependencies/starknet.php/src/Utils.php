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

use RuntimeException;
use InvalidArgumentException;
use stdClass;
use kornrunner\Keccak;
use phpseclib\Math\BigInteger as BigNumber;
use BN\BN;

class Utils
{
    /**
     * SHA3_NULL_HASH
     * 
     * @const string
     */
    const SHA3_NULL_HASH = 'c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470';

    /**
     * NEGATIVE1
     * Cannot work, see: http://php.net/manual/en/language.constants.syntax.php
     * 
     * @const
     */
    // const NEGATIVE1 = new BigNumber(-1);

    /**
     * construct
     *
     * @return void
     */
    // public function __construct() {}

    /**
     * toHex
     * Encoding string or integer or numeric string(is not zero prefixed) or big number to hex.
     * 
     * @param string|int|BigNumber $value
     * @param bool $isPrefix
     * @return string
     */
    public static function toHex($value, $isPrefix=false)
    {
        if (is_numeric($value)) {
            // turn to hex number
            $bn = self::toBn($value);
            $hex = $bn->toHex(true);
            $hex = preg_replace('/^0+(?!$)/', '', $hex);
        } elseif (is_string($value)) {
            if (self::isZeroPrefixed($value)) {
                return ($isPrefix) ? $value : self::stripZeroPrefix($value);
            }
            $hex = implode('', unpack('H*', $value));
        } elseif ($value instanceof BigNumber) {
            $hex = $value->toHex(true);
            $hex = preg_replace('/^0+(?!$)/', '', $hex);
        } else {
            throw new InvalidArgumentException('The value to toHex function is not support.');
        }
        if ($isPrefix) {
            return '0x' . $hex;
        }
        return $hex;
    }

    /**
     * hexToBin
     * 
     * @param string
     * @return string
     */
    public static function hexToBin($value)
    {
        if (!is_string($value)) {
            throw new InvalidArgumentException('The value to hexToBin function must be string.');
        }
        if (self::isZeroPrefixed($value)) {
            $count = 1;
            $value = str_replace('0x', '', $value, $count);
            // avoid suffix 0
            if (strlen($value) % 2 > 0) {
                $value = '0' . $value;
            }
        }
        return pack('H*', $value);
    }

    /**
     * isZeroPrefixed
     * 
     * @param string
     * @return bool
     */
    public static function isZeroPrefixed($value)
    {
        if (!is_string($value)) {
            throw new InvalidArgumentException('The value to isZeroPrefixed function must be string.');
        }
        return (strpos($value, '0x') === 0);
    }

    /**
     * stripZeroPrefix
     * 
     * @param string $value
     * @return string
     */
    public static function stripZeroPrefix($value)
    {
        if (self::isZeroPrefixed($value)) {
            $count = 1;
            return str_replace('0x', '', $value, $count);
        }
        return $value;
    }

    /**
     * removeLeadingZero
     * 
     * @param string $value
     * @return string
     */
    public static function removeLeadingZero($value)
    {
        if (!is_string($value)) {
            throw new InvalidArgumentException('The value to removeLeadingZero function must be string.');
        }
        return preg_replace('/^0+/', '', $value);
    }

    /**
     * isNegative
     * 
     * @param string
     * @return bool
     */
    public static function isNegative($value)
    {
        if (!is_string($value)) {
            throw new InvalidArgumentException('The value to isNegative function must be string.');
        }
        return (strpos($value, '-') === 0);
    }

    /**
     * isHex
     * 
     * @param string $value
     * @return bool
     */
    public static function isHex($value)
    {
        return (is_string($value) && preg_match('/^(0x)?[a-f0-9]*$/', $value) === 1);
    }

    /**
     * sha3
     * keccak256
     * 
     * @param string $value
     * @return string
     */
    public static function sha3($value)
    {
        if (!is_string($value)) {
            throw new InvalidArgumentException('The value to sha3 function must be string.');
        }
        if (strpos($value, '0x') === 0) {
            $value = self::hexToBin($value);
        }
        $hash = Keccak::hash($value, 256);

        if ($hash === self::SHA3_NULL_HASH) {
            return null;
        }
        return '0x' . $hash;
    }

    /**
     * toString
     * 
     * @param mixed $value
     * @return string
     */
    public static function toString($value)
    {
        $value = (string) $value;

        return $value;
    }

    /**
     * toBn
     * Change number or number string to bignumber.
     * 
     * @param BigNumber|string|int $number
     * @return array|\phpseclib\Math\BigInteger
     */
    public static function toBn($number)
    {
        if ($number instanceof BigNumber){
            $bn = $number;
        } elseif ($number instanceof BN) {
            $bn = new BigNumber($number->toString());
        } elseif (is_int($number)) {
            $bn = new BigNumber($number);
        } elseif (is_numeric($number)) {
            $number = (string) $number;

            if (self::isNegative($number)) {
                $count = 1;
                $number = str_replace('-', '', $number, $count);
                $negative1 = new BigNumber(-1);
            }
            if (strpos($number, '.') > 0) {
                $comps = explode('.', $number);

                if (count($comps) > 2) {
                    throw new InvalidArgumentException('toBn number must be a valid number.');
                }
                $whole = $comps[0];
                $fraction = $comps[1];

                return [
                    new BigNumber($whole),
                    new BigNumber($fraction),
                    strlen($comps[1]),
                    isset($negative1) ? $negative1 : false
                ];
            } else {
                $bn = new BigNumber($number);
            }
            if (isset($negative1)) {
                $bn = $bn->multiply($negative1);
            }
        } elseif (is_string($number)) {
            $number = mb_strtolower($number);

            if (self::isNegative($number)) {
                $count = 1;
                $number = str_replace('-', '', $number, $count);
                $negative1 = new BigNumber(-1);
            }
            if (self::isZeroPrefixed($number) || preg_match('/^[0-9a-f]+$/i', $number) === 1) {
                $number = self::stripZeroPrefix($number);
                $bn = new BigNumber($number, 16);
            } elseif (empty($number)) {
                $bn = new BigNumber(0);
            } else {
                throw new InvalidArgumentException('toBn number must be valid hex string.');
            }
            if (isset($negative1)) {
                $bn = $bn->multiply($negative1);
            }
        } else {
            throw new InvalidArgumentException('toBn number must be BigNumber, string or int.');
        }
        return $bn;
    }

    /**
     * hexToNumber
     * 
     * @param string $hexNumber
     * @return int
     */
    public static function hexToNumber($hexNumber)
    {
        if (!self::isZeroPrefixed($hexNumber)) {
            $hexNumber = '0x' . $hexNumber;
        }
        return intval(self::toBn($hexNumber)->toString());
    }

    /**
     * keccak
     * 
     * @param string $value
     * @return string
     */
    public static function keccak($value)
    {
        return self::toBn(self::sha3($value))->bitwise_and(Constants::MASK_250())->toHex();
    }
}