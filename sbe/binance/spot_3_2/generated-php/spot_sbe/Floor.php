<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class Floor
{
    public const EXCHANGE = 1;
    public const BROKER = 2;
    public const SOR = 3;
    public const NONREPRESENTABLE = 254;
    public const NULL_VALUE = 255;

    public static function encodedLength(): int
    {
        return 1;
    }
}
