<?php

declare(strict_types = 1);

namespace Sop\ASN1\Type;

/**
 * Trait for primitive types.
 */
trait PrimitiveType
{
    /**
     * @see \Sop\ASN1\Feature\ElementBase::isConstructed()
     */
    public function isConstructed(): bool
    {
        return false;
    }
}
