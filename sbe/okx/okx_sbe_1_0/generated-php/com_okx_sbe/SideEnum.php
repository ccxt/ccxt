<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class SideEnum
{
    public const SELL = 0;
    public const BUY = 1;
    public const NULL_VALUE = -128;

    public static function encodedLength(): int
    {
        return 1;
    }
}
