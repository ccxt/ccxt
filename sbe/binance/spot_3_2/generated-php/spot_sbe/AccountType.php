<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class AccountType
{
    public const SPOT = 0;
    public const UNKNOWN = 2;
    public const NONREPRESENTABLE = 254;
    public const NULL_VALUE = 255;

    public static function encodedLength(): int
    {
        return 1;
    }
}
