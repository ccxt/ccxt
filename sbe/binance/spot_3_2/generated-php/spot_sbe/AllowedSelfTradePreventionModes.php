<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class AllowedSelfTradePreventionModes
{
    public const NONE = 0;
    public const EXPIRETAKER = 1;
    public const EXPIREMAKER = 2;
    public const EXPIREBOTH = 3;
    public const DECREMENT = 4;
    public const TRANSFER = 5;
    public const NONREPRESENTABLE = 7;

    public static function encodedLength(): int
    {
        return 1;
    }
}
