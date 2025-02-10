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

use InvalidArgumentException;
use stdClass;
use Web3\Utils;
use Web3\Formatters\IntegerFormatter;
use Web3\Contracts\Types\Address;
use Web3\Contracts\Types\Boolean;
use Web3\Contracts\Types\Bytes;
use Web3\Contracts\Types\DynamicBytes;
use Web3\Contracts\Types\Integer;
use Web3\Contracts\Types\Str;
use Web3\Contracts\Types\Uinteger;
use Web3\Contracts\Types\SizedArray;
use Web3\Contracts\Types\DynamicArray;
use Web3\Contracts\Types\Tuple;

class Ethabi
{
    /**
     * types
     * 
     * @var array
     */
    protected $types = [];

    /**
     * construct
     * 
     * @param array $types
     * @return void
     */
    public function __construct($types=[])
    {
        if (!is_array($types)) {
            $types = [];
        }
        $this->types = array_merge($types, [
            'address' => new Address,
            'bool' => new Boolean,
            'bytes' => new Bytes,
            'dynamicBytes' => new DynamicBytes,
            'int' => new Integer,
            'string' => new Str,
            'uint' => new Uinteger,
            'sizedArray' => new SizedArray,
            'dynamicArray' => new DynamicArray,
            'tuple' => new Tuple,
        ]);
    }

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
     * @return mixed
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
        if (preg_match('/\[\]$/', $name) >= 1) {
            return true;
        }
        return false;
    }

    /**
     * isStaticArray
     * 
     * @param string $name
     * @return bool
     */
    public function isStaticArray($name)
    {
        if (preg_match('/\[[\d]+\]$/', $name) >= 1) {
            return true;
        }
        return false;
    }

    /**
     * isTuple
     * 
     * @param string $name
     * @return bool
     */
    public function isTuple($name)
    {
        if (preg_match('/^(tuple)?\((.*)\)$/', $name) >= 1) {
            return true;
        }
        return false;
    }

    /**
     * parseTupleType
     * 
     * @param string $name
     * @return bool
     */
    public function parseTupleType($name)
    {
        $matches = [];

        if (preg_match_all('/(tuple)?\((.*)\)/', $name, $matches, PREG_PATTERN_ORDER) >= 1) {
            return $matches[2][0];
        }
        return false;
    }

    /**
     * parseTupleTypes
     * TODO: replace with lexical analysis
     * 
     * @param string $type
     * @param bool $parseInner
     * @return array
     */
    protected function parseTupleTypes($type, $parseInner = false) {
        $leftBrackets = [];
        $results = [];
        $offset = 0;
        for ($key = 0; $key < mb_strlen($type); $key++) {
            $char = $type[$key];
            if ($char === '(') {
                $leftBrackets[] = $key;
            } else if ($char === ')') {
                $leftKey = array_pop($leftBrackets);
                if (is_null($leftKey)) {
                    throw new InvalidArgumentException('Wrong tuple type: ' . $type);
                }
            } else if ($char === ',') {
                if (empty($leftBrackets)) {
                    $length = $key - $offset;
                    $results[] = mb_substr($type, $offset, $length);
                    $offset += $length + 1;
                }
            }
        }
        if ($offset < mb_strlen($type)) {
            $results[] = mb_substr($type, $offset);
        }
        if ($parseInner) {
            if (count($results) === 1) {
                if ($results[0] === $type && $type[0] === '(' && $type[mb_strlen($type) - 1] === ')') {
                    $results[0] = mb_substr($type, 1, mb_strlen($type) - 2);
                }
            }
        }
        return $results;
    }

    /**
     * findAbiType
     * 
     * @param string $type
     * @return array
     */
    protected function findAbiType($type)
    {
        $result = [];
        if (!is_string($type)) {
            throw new InvalidArgumentException('type should be string');
        }
        $solidityType = $this->getSolidityType($type);
        if ($this->isDynamicArray($type)) {
            $nestedType = $this->nestedName($type);

            $result = [
                'type' => $type,
                'dynamic' => true,
                'solidityType' => $solidityType,
                'coders' => $this->findAbiType($nestedType)
            ];
            return $result;
        } elseif ($this->isStaticArray($type)) {
            $nestedType = $this->nestedName($type);

            $result = [
                'type' => $type,
                'dynamic' => false,
                'solidityType' => $solidityType,
                'coders' => $this->findAbiType($nestedType)
            ];
            if ($result['coders']['dynamic']) {
                $result['dynamic'] = true;
            }
            return $result;
        } elseif ($this->isTuple($type)) {
            $nestedType = $this->parseTupleTypes($type, true)[0];
            $parsedNestedTypes = $this->parseTupleTypes($nestedType);
            $tupleAbi = [
                'type' => $type,
                'dynamic' => false,
                'solidityType' => $solidityType,
                'coders' => []
            ];

            foreach ($parsedNestedTypes as $type_) {
                $parsedType = $this->findAbiType($type_);
                if ($parsedType['dynamic']) {
                    $tupleAbi['dynamic'] = true;
                }
                $tupleAbi['coders'][] = $parsedType;
            }
            $result = $tupleAbi;
            return $result;
        }
        $result = [
            'type' => $type,
            'solidityType' => $solidityType,
            'dynamic' => $solidityType->isDynamicType()
        ];
        return $result;
    }

    /**
     * getSolidityType
     * 
     * @param string $type
     * @return SolidityType
     */
    protected function getSolidityType($type)
    {
        $match = [];
        if ($this->isDynamicArray($type)) {
            return $this->types['dynamicArray'];
        } elseif ($this->isStaticArray($type)) {
            return $this->types['sizedArray'];
        } elseif ($this->isTuple($type)) {
            return $this->types['tuple'];
        }

        if (preg_match('/^([a-zA-Z]+)/', $type, $match) === 1) {
            $className = (array_key_exists($match[0], $this->types)) ? $this->types[$match[0]] : null;
            if (isset($className)) {
                if (call_user_func([$className, 'isType'], $type) === false) {
                    // check dynamic bytes
                    if ($match[0] === 'bytes') {
                        $className = $this->types['dynamicBytes'];
                    }
                }
                return $className;
            }
        }
        throw new InvalidArgumentException('Unsupport solidity parameter type: ' . $type);
    }

    /**
     * parseAbiTypes
     * 
     * @param array $types
     * @return array
     */
    protected function parseAbiTypes($types)
    {
        $result = [];
        foreach ($types as $type) {
            $result[] = $this->findAbiType($type);
        }
        return $result;
    }

    /**
     * encodeFunctionSignature
     * 
     * @param string|stdClass|array $functionName
     * @return string
     */
    public function encodeFunctionSignature($functionName)
    {
        if (!is_string($functionName)) {
            $functionName = Utils::jsonMethodToString($functionName);
        }
        return mb_substr(Utils::sha3($functionName), 0, 10);
    }

    /**
     * encodeEventSignature
     * TODO: Fix same event name with different params
     * 
     * @param string|stdClass|array $functionName
     * @return string
     */
    public function encodeEventSignature($functionName)
    {
        if (!is_string($functionName)) {
            $functionName = Utils::jsonMethodToString($functionName);
        }
        return Utils::sha3($functionName);
    }

    /**
     * encodeParameter
     * 
     * @param string $type
     * @param mixed $param
     * @return string
     */
    public function encodeParameter($type, $param)
    {
        if (!is_string($type)) {
            throw new InvalidArgumentException('The type to encodeParameter must be string.');
        }
        return $this->encodeParameters([$type], [$param]);
    }

    /**
     * encodeParameters
     * 
     * @param stdClass|array $types
     * @param array $params
     * @return string
     */
    public function encodeParameters($types, $params)
    {
        // change json to array
        if ($types instanceof stdClass && isset($types->inputs)) {
            $types = Utils::jsonToArray($types, 2);
        }
        if (is_array($types) && isset($types['inputs'])) {
            $inputTypes = $types;
            $types = [];

            foreach ($inputTypes['inputs'] as $input) {
                if (isset($input['type'])) {
                    $types[] = $input['type'];
                }
            }
        }
        if (count($types) !== count($params)) {
            throw new InvalidArgumentException('encodeParameters number of types must equal to number of params.');
        }
        $typesLength = count($types);
        $encodes = array_fill(0, $typesLength, '');
        $abiTypes = $this->parseAbiTypes($types);

        // encode with tuple type
        return '0x' . $this->types['tuple']->encode($params, [ 'coders' => $abiTypes ]);
    }

    /**
     * decodeParameter
     * 
     * @param string $type
     * @param mixed $param
     * @return string
     */
    public function decodeParameter($type, $param)
    {
        if (!is_string($type)) {
            throw new InvalidArgumentException('The type to decodeParameter must be string.');
        }
        return $this->decodeParameters([$type], $param)[0];
    }

    /**
     * decodeParameters
     * 
     * @param stdClass|array $type
     * @param string $param
     * @return string
     */
    public function decodeParameters($types, $param)
    {
        if (!is_string($param)) {
            throw new InvalidArgumentException('The param must be string.');
        }

        // change json to array
        $outputTypes = [];
        if ($types instanceof stdClass && isset($types->outputs)) {
            $types = Utils::jsonToArray($types, 2);
        }
        if (is_array($types) && isset($types['outputs'])) {
            $outputTypes = $types;
            $types = [];

            foreach ($outputTypes['outputs'] as $output) {
                if (isset($output['type'])) {
                    $types[] = $output['type'];
                }
            }
        }
        $typesLength = count($types);
        $abiTypes = $this->parseAbiTypes($types);

        // decode with tuple type
        $results = [];
        $decodeResults = $this->types['tuple']->decode(Utils::stripZero($param), 0, [ 'coders' => $abiTypes ]);
        for ($i = 0; $i < $typesLength; $i++) {
            if (isset($outputTypes['outputs'][$i]['name']) && empty($outputTypes['outputs'][$i]['name']) === false) {
                $results[$outputTypes['outputs'][$i]['name']] = $decodeResults[$i];
            } else {
                $results[$i] = $decodeResults[$i];
            }
        }
        return $results;
    }
}