<?php

declare(strict_types = 1);

namespace Sop\ASN1\Component;

use Sop\ASN1\Exception\DecodeException;
use Sop\ASN1\Feature\Encodable;
use Sop\ASN1\Util\BigInt;

/**
 * Class to represent BER/DER length octets.
 */
class Length implements Encodable
{
    /**
     * Length.
     *
     * @var BigInt
     */
    private $_length;

    /**
     * Whether length is indefinite.
     *
     * @var bool
     */
    private $_indefinite;

    /**
     * Constructor.
     *
     * @param \GMP|int|string $length     Length
     * @param bool            $indefinite Whether length is indefinite
     */
    public function __construct($length, bool $indefinite = false)
    {
        $this->_length = new BigInt($length);
        $this->_indefinite = $indefinite;
    }

    /**
     * Decode length component from DER data.
     *
     * @param string   $data   DER encoded data
     * @param null|int $offset Reference to the variable that contains offset
     *                         into the data where to start parsing.
     *                         Variable is updated to the offset next to the
     *                         parsed length component. If null, start from offset 0.
     *
     * @throws DecodeException If decoding fails
     */
    public static function fromDER(string $data, ?int &$offset = null): self
    {
        $idx = $offset ?? 0;
        $datalen = strlen($data);
        if ($idx >= $datalen) {
            throw new DecodeException(
                'Unexpected end of data while decoding length.');
        }
        $indefinite = false;
        $byte = ord($data[$idx++]);
        // bits 7 to 1
        $length = (0x7f & $byte);
        // long form
        if (0x80 & $byte) {
            if (!$length) {
                $indefinite = true;
            } else {
                if ($idx + $length > $datalen) {
                    throw new DecodeException(
                        'Unexpected end of data while decoding long form length.');
                }
                $length = self::_decodeLongFormLength($length, $data, $idx);
            }
        }
        if (isset($offset)) {
            $offset = $idx;
        }
        return new self($length, $indefinite);
    }

    /**
     * Decode length from DER.
     *
     * Throws an exception if length doesn't match with expected or if data
     * doesn't contain enough bytes.
     *
     * Requirement of definite length is relaxed contrary to the specification
     * (sect. 10.1).
     *
     * @see self::fromDER
     *
     * @param string   $data     DER data
     * @param int      $offset   Reference to the offset variable
     * @param null|int $expected Expected length, null to bypass checking
     *
     * @throws DecodeException If decoding or expectation fails
     */
    public static function expectFromDER(string $data, int &$offset,
        ?int $expected = null): self
    {
        $idx = $offset;
        $length = self::fromDER($data, $idx);
        // if certain length was expected
        if (isset($expected)) {
            if ($length->isIndefinite()) {
                throw new DecodeException(
                    sprintf('Expected length %d, got indefinite.', $expected));
            }
            if ($expected !== $length->intLength()) {
                throw new DecodeException(
                    sprintf('Expected length %d, got %d.', $expected,
                        $length->intLength()));
            }
        }
        // check that enough data is available
        if (!$length->isIndefinite()
            && strlen($data) < $idx + $length->intLength()) {
            throw new DecodeException(
                sprintf('Length %d overflows data, %d bytes left.',
                    $length->intLength(), strlen($data) - $idx));
        }
        $offset = $idx;
        return $length;
    }

    /**
     * {@inheritdoc}
     *
     * @throws \DomainException If length is too large to encode
     */
    public function toDER(): string
    {
        $bytes = [];
        if ($this->_indefinite) {
            $bytes[] = 0x80;
        } else {
            $num = $this->_length->gmpObj();
            // long form
            if ($num > 127) {
                $octets = [];
                for (; $num > 0; $num >>= 8) {
                    $octets[] = gmp_intval(0xff & $num);
                }
                $count = count($octets);
                // first octet must not be 0xff
                if ($count >= 127) {
                    throw new \DomainException('Too many length octets.');
                }
                $bytes[] = 0x80 | $count;
                foreach (array_reverse($octets) as $octet) {
                    $bytes[] = $octet;
                }
            }
            // short form
            else {
                $bytes[] = gmp_intval($num);
            }
        }
        return pack('C*', ...$bytes);
    }

    /**
     * Get the length.
     *
     * @throws \LogicException If length is indefinite
     *
     * @return string Length as an integer string
     */
    public function length(): string
    {
        if ($this->_indefinite) {
            throw new \LogicException('Length is indefinite.');
        }
        return $this->_length->base10();
    }

    /**
     * Get the length as an integer.
     *
     * @throws \LogicException   If length is indefinite
     * @throws \RuntimeException If length overflows integer size
     */
    public function intLength(): int
    {
        if ($this->_indefinite) {
            throw new \LogicException('Length is indefinite.');
        }
        return $this->_length->intVal();
    }

    /**
     * Whether length is indefinite.
     */
    public function isIndefinite(): bool
    {
        return $this->_indefinite;
    }

    /**
     * Decode long form length.
     *
     * @param int    $length Number of octets
     * @param string $data   Data
     * @param int    $offset reference to the variable containing offset to the data
     *
     * @throws DecodeException If decoding fails
     */
    private static function _decodeLongFormLength(int $length, string $data,
        int &$offset): \GMP
    {
        // first octet must not be 0xff (spec 8.1.3.5c)
        if (127 === $length) {
            throw new DecodeException('Invalid number of length octets.');
        }
        $num = gmp_init(0, 10);
        while (--$length >= 0) {
            $byte = ord($data[$offset++]);
            $num <<= 8;
            $num |= $byte;
        }
        return $num;
    }
}
