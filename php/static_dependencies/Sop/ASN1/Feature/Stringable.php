<?php

declare(strict_types = 1);

namespace Sop\ASN1\Feature;

/**
 * Interface for classes that may be cast to string.
 */
interface Stringable
{
    /**
     * Convert object to string.
     */
    public function __toString(): string;

    /**
     * Get the string representation of the type.
     */
    public function string(): string;
}
