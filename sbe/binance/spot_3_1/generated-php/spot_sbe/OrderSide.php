<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class OrderSide
{
    public const BUY = 0;
    public const SELL = 1;
    public const NONREPRESENTABLE = 254;
    public const NULL_VALUE = 255;

    public static function encodedLength(): int
    {
        return 1;
    }
}
