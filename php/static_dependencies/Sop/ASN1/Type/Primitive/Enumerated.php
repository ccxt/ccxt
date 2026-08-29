<?php

declare(strict_types = 1);

namespace Sop\ASN1\Type\Primitive;

/**
 * Implements *ENUMERATED* type.
 */
class Enumerated extends Integer
{
    /**
     * Constructor.
     *
     * @param int|string $number
     */
    public function __construct($number)
    {
        parent::__construct($number);
        $this->_typeTag = self::TYPE_ENUMERATED;
    }
}
