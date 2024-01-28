<?php

/**
 * This file is part of web3.php package.
 * 
 * (c) Kuan-Cheng,Lai <alk03073135@gmail.com>
 * 
 * @author Peter Lai <alk03073135@gmail.com>
 * @license MIT
 */

namespace Web3\Contracts\Types;

use InvalidArgumentException;
use Web3\Utils;
use Web3\Contracts\SolidityType;
use Web3\Contracts\Types\IType;

class DynamicBytes extends SolidityType implements IType
{
    /**
     * construct
     * 
     * @return void
     */
    public function __construct()
    {
        //
    }

    /**
     * isType
     * 
     * @param string $name
     * @return bool
     */
    public function isType($name)
    {
        return (preg_match('/^bytes(\[([0-9]*)\])*$/', $name) === 1);
    }

    /**
     * isDynamicType
     * 
     * @return bool
     */
    public function isDynamicType()
    {
        return true;
    }

    /**
     * inputFormat
     * 
     * @param mixed $value
     * @param array $abiType
     * @return string
     */
    public function inputFormat($value, $abiType)
    {
        if (!Utils::isHex($value)) {
            throw new InvalidArgumentException('The value to inputFormat must be hex bytes.');
        }
        $value = Utils::stripZero($value);

        if (mb_strlen($value) % 2 !== 0) {
            $value = "0" . $value;
            // throw new InvalidArgumentException('The value to inputFormat has invalid length.');
        }
        $bn = Utils::toBn(floor(mb_strlen($value) / 2));
        $bnHex = $bn->toHex(true);
        $padded = mb_substr($bnHex, 0, 1);

        if ($padded !== '0' && $padded !== 'f') {
            $padded = '0';
        }
        $l = floor((mb_strlen($value) + 63) / 64);
        $padding = (($l * 64 - mb_strlen($value) + 1) >= 0) ? $l * 64 - mb_strlen($value) : 0;

        return implode('', array_fill(0, 64-mb_strlen($bnHex), $padded)) . $bnHex . $value . implode('', array_fill(0, $padding, '0'));
    }

    /**
     * outputFormat
     * 
     * @param mixed $value
     * @param array $abiType
     * @return string
     */
    public function outputFormat($value, $abiType)
    {
        $checkZero = str_replace('0', '', $value);

        if (empty($checkZero)) {
            return '0';
        }
        $size = intval(Utils::toBn('0x' . mb_substr($value, 0, 64))->toString());
        $length = 2 * $size;
        
        return '0x' . mb_substr($value, 64, $length);
    }
}