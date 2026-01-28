<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class AllocationType
{
    public const UNKNOWN = 0;
    public const SOR = 2;
    public const NONREPRESENTABLE = 254;
    public const NULL_VALUE = 255;

    public static function encodedLength(): int
    {
        return 1;
    }
}
