<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class RateLimitInterval
{
    public const SECOND = 0;
    public const MINUTE = 1;
    public const HOUR = 2;
    public const DAY = 3;
    public const NONREPRESENTABLE = 254;
    public const NULL_VALUE = 255;

    public static function encodedLength(): int
    {
        return 1;
    }
}
