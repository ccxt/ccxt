<?php

declare(strict_types = 1);

namespace Sop\ASN1\Type\Primitive;

use Sop\ASN1\Type\PrimitiveString;
use Sop\ASN1\Type\UniversalClass;

/**
 * Implements *BMPString* type.
 *
 * BMP stands for Basic Multilingual Plane. This is generally an Unicode string
 * with UCS-2 encoding.
 */
class BMPString extends PrimitiveString
{
    use UniversalClass;

    /**
     * Constructor.
     */
    public function __construct(string $string)
    {
        $this->_typeTag = self::TYPE_BMP_STRING;
        parent::__construct($string);
    }

    /**
     * {@inheritdoc}
     */
    protected function _validateString(string $string): bool
    {
        // UCS-2 has fixed with of 2 octets (16 bits)
        if (0 !== strlen($string) % 2) {
            return false;
        }
        return true;
    }
}
