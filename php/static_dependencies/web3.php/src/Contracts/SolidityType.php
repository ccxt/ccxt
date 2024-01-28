<?php

/**
 * This file is part of web3.php package.
 * 
 * (c) Kuan-Cheng,Lai <alk03073135@gmail.com>
 * 
 * @author Peter Lai <alk03073135@gmail.com>
 * @license MIT
 */

namespace Web3\Contracts;

use Web3\Utils;
use Web3\Formatters\IntegerFormatter;

class SolidityType
{
    /**
     * construct
     * 
     * @return void
     */
    // public function  __construct() {}

    /**
     * get
     * 
     * @param string $name
     * @return mixed
     */
    public function __get($name)
    {
        $method = 'get' . ucfirst($name);

        if (method_exists($this, $method)) {
            return call_user_func_array([$this, $method], []);
        }
        return false;
    }

    /**
     * set
     * 
     * @param string $name
     * @param mixed $value
     * @return mixed;
     */
    public function __set($name, $value)
    {
        $method = 'set' . ucfirst($name);

        if (method_exists($this, $method)) {
            return call_user_func_array([$this, $method], [$value]);
        }
        return false;
    }

    /**
     * callStatic
     * 
     * @param string $name
     * @param array $arguments
     * @return void
     */
    // public static function __callStatic($name, $arguments) {}

    /**
     * nestedTypes
     * 
     * @param string $name
     * @return mixed
     */
    public function nestedTypes($name)
    {
        if (!is_string($name)) {
            throw new InvalidArgumentException('nestedTypes name must string.');
        }
        $matches = [];

        if (preg_match_all('/(\[[0-9]*\])/', $name, $matches, PREG_PATTERN_ORDER) >= 1) {
            return $matches[0];
        }
        return false;
    }

    /**
     * nestedName
     * 
     * @param string $name
     * @return string
     */
    public function nestedName($name)
    {
        if (!is_string($name)) {
            throw new InvalidArgumentException('nestedName name must string.');
        }
        $nestedTypes = $this->nestedTypes($name);

        if ($nestedTypes === false) {
            return $name;
        }
        return mb_substr($name, 0, mb_strlen($name) - mb_strlen($nestedTypes[count($nestedTypes) - 1]));
    }

    /**
     * isDynamicArray
     * 
     * @param string $name
     * @return bool
     */
    public function isDynamicArray($name)
    {
        $nestedTypes = $this->nestedTypes($name);

        return $nestedTypes && preg_match('/[0-9]{1,}/', $nestedTypes[count($nestedTypes) - 1]) !== 1;
    }

    /**
     * isStaticArray
     * 
     * @param string $name
     * @return bool
     */
    public function isStaticArray($name)
    {
        $nestedTypes = $this->nestedTypes($name);

        return $nestedTypes && preg_match('/[0-9]{1,}/', $nestedTypes[count($nestedTypes) - 1]) === 1;
    }

    /**
     * staticArrayLength
     * 
     * @param string $name
     * @return int
     */
    public function staticArrayLength($name)
    {
        $nestedTypes = $this->nestedTypes($name);

        if ($nestedTypes === false) {
            return 1;
        }
        $match = [];

        if (preg_match('/[0-9]{1,}/', $nestedTypes[count($nestedTypes) - 1], $match) === 1) {
            return (int) $match[0];
        }
        return 1;
    }

    /**
     * staticPartLength
     * 
     * @param string $name
     * @return int
     */
    public function staticPartLength($name)
    {
        $nestedTypes = $this->nestedTypes($name);

        if ($nestedTypes === false) {
            $nestedTypes = ['[1]'];
        }
        $count = 32;

        foreach ($nestedTypes as $type) {
            $num = mb_substr($type, 1, 1);

            if (!is_numeric($num)) {
                $num = 1;
            } else {
                $num = intval($num);
            }
            $count *= $num;
        }

        return $count;
    }

    /**
     * isDynamicType
     * 
     * @return bool
     */
    public function isDynamicType()
    {
        return false;
    }

    /**
     * deepCalculateDataLength
     * Calculate static data size recursively.
     * TODO: Improve this function, or calculate data length when parse abi.
     * 
     * @param array $data
     * @return integer
     */
    public function deepCalculateDataLength($data)
    {
        if (!is_array($data)) return 1;
        $dataCount = 0;
        foreach ($data as $d) {
            if (is_array($d)) {
                $dataCount += $this->deepCalculateDataLength($d);
            } else {
                $dataCount += 1;
            }
        }
        return $dataCount;
    }

    /**
     * encode
     * 
     * @param mixed $value
     * @param mixed $name
     * @return string
     */
    public function encode($value, $name)
    {
        return $this->inputFormat($value, $name);
    }

    /**
     * decode
     * 
     * @param string $value
     * @param integer $offset
     * @param array $abiTypes
     * @return array
     */
    public function decode($value, $offset, $abiTypes)
    {
        if (!is_string($value)) {
            throw new InvalidArgumentException('Decode value should be string');
        }
        $value = mb_substr($value, $offset);
        return $this->outputFormat($value, $abiTypes);
    }
}