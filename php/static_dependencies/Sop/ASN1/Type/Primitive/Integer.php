<?php

declare(strict_types = 1);

namespace Sop\ASN1\Type\Primitive;

use Sop\ASN1\Component\Identifier;
use Sop\ASN1\Component\Length;
use Sop\ASN1\Element;
use Sop\ASN1\Feature\ElementBase;
use Sop\ASN1\Type\PrimitiveType;
use Sop\ASN1\Type\UniversalClass;
use Sop\ASN1\Util\BigInt;

/**
 * Implements *INTEGER* type.
 */
class Integer extends Element
{
    use UniversalClass;
    use PrimitiveType;

    /**
     * The number.
     *
     * @var BigInt
     */
    private $_number;

    /**
     * Constructor.
     *
     * @param \GMP|int|string $number Base 10 integer
     */
    public function __construct($number)
    {
        $this->_typeTag = self::TYPE_INTEGER;
        if (!self::_validateNumber($number)) {
            $var = is_scalar($number) ? strval($number) : gettype($number);
            throw new \InvalidArgumentException("'{$var}' is not a valid number.");
        }
        $this->_number = new BigInt($number);
    }

    /**
     * Get the number as a base 10.
     *
     * @return string Integer as a string
     */
    public function number(): string
    {
        return $this->_number->base10();
    }

    /**
     * Get the number as an integer type.
     */
    public function intNumber(): int
    {
        return $this->_number->intVal();
    }

    /**
     * {@inheritdoc}
     */
    protected function _encodedContentDER(): string
    {
        return $this->_number->signedOctets();
    }

    /**
     * {@inheritdoc}
     */
    protected static function _decodeFromDER(Identifier $identifier,
        string $data, int &$offset): ElementBase
    {
        $idx = $offset;
        $length = Length::expectFromDER($data, $idx)->intLength();
        $bytes = substr($data, $idx, $length);
        $idx += $length;
        $num = BigInt::fromSignedOctets($bytes)->gmpObj();
        $offset = $idx;
        // late static binding since enumerated extends integer type
        return new static($num);
    }

    /**
     * Test that number is valid for this context.
     *
     * @param mixed $num
     */
    private static function _validateNumber($num): bool
    {
        if (is_int($num)) {
            return true;
        }
        if (is_string($num) && preg_match('/-?\d+/', $num)) {
            return true;
        }
        if ($num instanceof \GMP) {
            return true;
        }
        return false;
    }
}
