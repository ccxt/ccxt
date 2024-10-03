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

trait Hash
{
    /**
     * computeHashOnElements
     * 
     * @param array $data
     * @return BigNumber pedersen hash of the elements
     */
    public static function computeHashOnElements(array $data)
    {
        $merged = array_merge($data, [count($data)]);
        return array_reduce($merged, fn ($x, $y) => self::hash($x, $y), 0);
    }
}