<?php

declare(strict_types = 1);

namespace Sop\ASN1\Type;

use Sop\ASN1\Component\Identifier;

/**
 * Trait for types of universal class.
 */
trait UniversalClass
{
    /**
     * @see \Sop\ASN1\Feature\ElementBase::typeClass()
     */
    public function typeClass(): int
    {
        return Identifier::CLASS_UNIVERSAL;
    }
}
