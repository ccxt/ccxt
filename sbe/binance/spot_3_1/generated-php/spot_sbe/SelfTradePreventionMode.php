<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class SelfTradePreventionMode
{
    public const NONE = 1;
    public const EXPIRETAKER = 2;
    public const EXPIREMAKER = 3;
    public const EXPIREBOTH = 4;
    public const DECREMENT = 5;
    public const NONREPRESENTABLE = 254;
    public const NULL_VALUE = 255;

    public static function encodedLength(): int
    {
        return 1;
    }
}
