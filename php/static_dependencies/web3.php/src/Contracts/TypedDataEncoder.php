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
use Web3\Utils;
use Web3\Formatters\IntegerFormatter;
use Web3\Contracts\Ethabi;

class TypedDataEncoder
{
    /**
     * ethabi
     * 
     * @var \Web3\Contracts\Ethabi
     */
    protected $ethabi;

    /**
     * eip712SolidityTypes
     * 
     * @var array
     */
    protected $eip712SolidityTypes = [
        'bool', 'address', 'string', 'bytes', 'uint', 'int',
        'int8', 'int16', 'int24', 'int32', 'int40', 'int48', 'int56', 'int64', 'int72', 'int80', 'int88', 'int96', 'int104', 'int112', 'int120', 'int128', 'int136', 'int144', 'int152', 'int160', 'int168', 'int176', 'int184', 'int192', 'int200', 'int208', 'int216', 'int224', 'int232', 'int240', 'int248', 'int256',
        'uint8', 'uint16', 'uint24', 'uint32', 'uint40', 'uint48', 'uint56', 'uint64', 'uint72', 'uint80', 'uint88', 'uint96', 'uint104', 'uint112', 'uint120', 'uint128', 'uint136', 'uint144', 'uint152', 'uint160', 'uint168', 'uint176', 'uint184', 'uint192', 'uint200', 'uint208', 'uint216', 'uint224', 'uint232', 'uint240', 'uint248', 'uint256',
        'bytes1', 'bytes2', 'bytes3', 'bytes4', 'bytes5', 'bytes6', 'bytes7', 'bytes8', 'bytes9', 'bytes10', 'bytes11', 'bytes12', 'bytes13', 'bytes14', 'bytes15', 'bytes16', 'bytes17', 'bytes18', 'bytes19', 'bytes20', 'bytes21', 'bytes22', 'bytes23', 'bytes24', 'bytes25', 'bytes26', 'bytes27', 'bytes28', 'bytes29', 'bytes30', 'bytes31', 'bytes32'
    ];

    /**
     * construct
     * 
     * @return void
     */
    public function __construct()
    {
        $this->ethabi = new Ethabi();
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
     * getEthabi
     * 
     * @return \Web3\Contracts\Ethabi
     */
    public function getEthabi()
    {
        return $this->ethabi;
    }

    /**
     * encodeField
     * 
     * @param array $types
     * @param string $name
     * @param string $type
     * @param mixed $value
     * @return array
     */
    protected function encodeField(array $types, string $name, string $type, $value)
    {
        if (array_key_exists($type, $types)) {
            if (is_null($value)) {
                return ['bytes32', '0x0000000000000000000000000000000000000000000000000000000000000000'];
            } else {
                return ['bytes32', Utils::sha3($this->encodeData($type, $types, $value))];
            }
        } else if (is_null($value)) {
            if ($type === 'string' || $type === 'bytes') {
                return ['bytes32', ''];
            } else {
                throw new InvalidArgumentException(
                    'Missing value for field ' . $name . ' of type ' . $type
                );
            }
        } else if ($this->strEndsWith($type, ']')) {
            if (!is_array($value)) {
                throw new InvalidArgumentException(
                    'Invalid value for field ' . $name . ' of type ' . $type . ': expected array'
                );
            }
            $parsedType = $this->parseParentArrayType($type);
            $dataTypes = [];
            $dataValues = [];
            foreach ($value as $item) {
                list($dataType, $dataValue) = $this->encodeField($types, $name, $parsedType, $item);
                $dataTypes[] = $dataType;
                $dataValues[] = $dataValue;
            }
            if (count($dataTypes) == 0) {
                # the keccak hash of `encode((), ())`
                return ['bytes32', '0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470'];
            }
            return ["bytes32", Utils::sha3($this->ethabi->encodeParameters($dataTypes, $dataValues))];
        } else if ($type === 'bool') {
            return [$type, (bool)$value];
        } else if (substr($type, 0, 5) === 'bytes') {
            if ($type === 'bytes') {
                return ['bytes32', Utils::sha3($value)];
            }
            return [$type, $value];
        } else if ($type === 'string') {
            return ['bytes32', Utils::sha3('0x' . Utils::toHex($value))];
        } else if (is_string($value) && preg_match('/^u?int/', $type) === 1) {
            $bn = Utils::toBn($value);
            return [$type, $bn->toString()];
        }
        return [$type, $value];
    }

    /**
     * strEndsWith
     * 
     * @param string $haystack
     * @param string $needle
     * @return bool
     */
    protected function strEndsWith(string $haystack, string $needle)
    {
        $needle_len = strlen($needle);
        return ($needle_len === 0 || 0 === substr_compare($haystack, $needle, - $needle_len));
    }

    /**
     * parseParentArrayType
     * 
     * @param string $type
     * @return string
     */
    protected function parseParentArrayType(string $type)
    {
        if ($this->strEndsWith($type, ']')) {
            $pos = strrpos($type, '[');
            $type = ($pos !== false) ? substr($type, 0, $pos) : $type;
        }
        return $type;
    }

    /**
     * parseArrayType
     * 
     * @param string $type
     * @return string
     */
    protected function parseArrayType(string $type)
    {
        if ($this->strEndsWith($type, ']')) {
            $pos = strpos($type, '[');
            $type = ($pos !== false) ? substr($type, 0, $pos) : $type;
        }
        return $type;
    }

    /**
     * findType
     * 
     * @param string $type
     * @param array $types
     * @return string
     */
    protected function findType(string $type, array $types)
    {
        $result = [];
        $type = $this->parseArrayType($type);
        if (in_array($type, $this->eip712SolidityTypes) || in_array($type, $result)) {
            return $result;
        } else if (!array_key_exists($type, $types)) {
            throw new InvalidArgumentException('No definition of type ' . $type);
        }

        $result[] = $type;
        foreach ($types[$type] as $field) {
            $subResult = $this->findType($field['type'], $types);
            if (count($subResult) > 0) {
                $result = array_merge($result, $subResult);
            }
        }
        return $result;
    }

    /**
     * encodeType
     * 
     * @param string $type
     * @param array $types
     * @return string
     */
    protected function encodeType(string $type, array $types)
    {
        $result = '';
        $unsortedDeps = $this->findType($type, $types);
        if (in_array($type, $unsortedDeps)) {
            array_splice($unsortedDeps, array_search($type, $unsortedDeps), 1);
        }
        sort($unsortedDeps);
        $deps = array_merge([ $type ], $unsortedDeps);
        foreach ($deps as $type) {
            $params = [];
            foreach ($types[$type] as $param) {
                $params[] = $param['type'] . ' ' . $param['name'];
            }
            $result .= $type . '(' . implode(',', $params) . ')';
        }
        return $result;
    }

    /**
     * hashType
     * 
     * @param string $type
     * @param array $types
     * @return string
     */
    protected function hashType(string $type, array $types)
    {
        $encodedType = $this->encodeType($type, $types);
        return Utils::sha3($encodedType);
    }

    /**
     * encodeData
     * 
     * @param string $type
     * @param array $types
     * @param array $data
     * @return string
     */
    protected function encodeData(string $type, array $types, array $data)
    {
        $encodedTypes = ['bytes32'];
        $encodedValues = [$this->hashType($type, $types)];

        foreach ($types[$type] as $field) {
            list($type, $value) = $this->encodeField($types, $field['name'], $field['type'], $data[$field['name']]);
            $encodedTypes[] = $type;
            $encodedValues[] = $value;
        }

        return $this->ethabi->encodeParameters($encodedTypes, $encodedValues);
    }

    /**
     * hashStruct
     * 
     * @param string $type
     * @param array $types
     * @param array $data
     * @return string
     */
    protected function hashStruct(string $type, array $types, array $data)
    {
        $encodedData = $this->encodeData($type, $types, $data);
        return Utils::sha3($encodedData);
    }

    /**
     * getPrimaryType
     * 
     * @param array types
     * @return string
     */
    protected function getPrimaryType(array $types)
    {
        $customTypes = array_keys($types);
        $customDepsTypes = [];
        foreach ($types as $key => $typeFields) {
            foreach ($typeFields as $field) {
                $type = $this->parseArrayType($field['type']);
                if (in_array($type, $customTypes) && $type !== $key) {
                    $customDepsTypes[] = $type;
                }
            }
        }
        $primaryType = array_values(array_diff($customTypes, $customDepsTypes));
        if (count($primaryType) === 0) {
            throw new InvalidArgumentException('Unable to determine primary type');
        }
        return $primaryType[0];
    }

    /**
     * hashEIP712Message
     * 
     * @param array $messageTypes
     * @param array $messageData
     * @return string
     */
    public function hashEIP712Message(array $messageTypes, array $messageData)
    {
        $primaryType = $this->getPrimaryType($messageTypes);
        return $this->hashStruct($primaryType, $messageTypes, $messageData);
    }

    /**
     * hashDomain
     * 
     * @param array $domain
     * @return string
     */
    public function hashDomain(array $domainData)
    {
        $eip721Domain = [
            'name' => [
                'name' => 'name',
                'type' => 'string'
            ],
            'version' => [
                'name' => 'version',
                'type' => 'string'
            ],
            'chainId' => [
                'name' => 'chainId',
                'type' => 'uint256'
            ],
            'verifyingContract' => [
                'name' => 'verifyingContract',
                'type' => 'address'
            ],
            'salt' => [
                'name' => 'salt',
                'type' => 'bytes32'
            ]
        ];
        foreach ($domainData as $key => $data) {
            if (!array_key_exists($key, $eip721Domain)) {
                throw new InvalidArgumentException('Invalid domain key: ' . $key);
            }
        }
        $domainTypes = [
            'EIP712Domain' => []
        ];
        foreach ($eip721Domain as $key => $data) {
            if (array_key_exists($key, $domainData)) {
                $domainTypes['EIP712Domain'][] = $eip721Domain[$key];
            }
        }
        return $this->hashStruct('EIP712Domain', $domainTypes, $domainData);
    }

    /**
     * encodeTypedData
     * 
     * @param array $domainData
     * @param array $messageTypes
     * @param array $messageData
     */
    public function encodeTypedData(array $domainData, array $messageTypes, array $messageData)
    {
        $hashedDomain = $this->hashDomain($domainData);
        $hashedMessage = $this->hashEIP712Message($messageTypes, $messageData);
        return sprintf('0x1901%s%s', Utils::stripZero($hashedDomain), Utils::stripZero($hashedMessage));
    }
}