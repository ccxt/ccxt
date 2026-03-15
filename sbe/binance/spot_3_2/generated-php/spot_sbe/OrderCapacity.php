<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class OrderCapacity
{
    public const PRINCIPAL = 1;
    public const AGENCY = 2;
    public const NONREPRESENTABLE = 254;
    public const NULL_VALUE = 255;

    public static function encodedLength(): int
    {
        return 1;
    }
}
