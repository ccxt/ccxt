<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class TimeInForce
{
    public const GTC = 0;
    public const IOC = 1;
    public const FOK = 2;
    public const NONREPRESENTABLE = 254;
    public const NULL_VALUE = 255;

    public static function encodedLength(): int
    {
        return 1;
    }
}
