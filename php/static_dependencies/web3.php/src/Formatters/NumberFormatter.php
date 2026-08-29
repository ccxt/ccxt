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

class NumberFormatter implements IFormatter
{
    /**
     * format
     * 
     * @param int|float $value
     * @return int|float
     */
    public static function format($value)
    {
        return $value;
    }
}