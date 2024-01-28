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
use Web3\Formatters\BigNumberFormatter;

class FeeHistoryFormatter implements IFormatter
{
    /**
     * format
     * 
     * @param mixed $value
     * @return string
     */
    public static function format($value)
    {
        if (isset($value->oldestBlock)) {
            $value->oldestBlock = BigNumberFormatter::format($value->oldestBlock);
        }
        if (isset($value->baseFeePerGas)) {
            foreach ($value->baseFeePerGas as $key => $baseFeePerGas) {
                $value->baseFeePerGas[$key] = BigNumberFormatter::format($baseFeePerGas);
            }
        }
        if (isset($value->reward)) {
            foreach ($value->reward as $keyOut => $rewards) {
                foreach ($rewards as $keyIn => $reward) {
                    $value->reward[$keyOut][$keyIn] = BigNumberFormatter::format($reward);
                }
            }
        }
        return $value;
    }
}