<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class BoolEnum
{
    public const FALSE = 0;
    public const TRUE = 1;
    public const NULL_VALUE = 255;

    public static function encodedLength(): int
    {
        return 1;
    }
}
