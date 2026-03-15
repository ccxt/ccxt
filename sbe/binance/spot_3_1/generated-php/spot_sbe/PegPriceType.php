<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class PegPriceType
{
    public const PRIMARYPEG = 1;
    public const MARKETPEG = 2;
    public const NONREPRESENTABLE = 254;
    public const NULL_VALUE = 255;

    public static function encodedLength(): int
    {
        return 1;
    }
}
