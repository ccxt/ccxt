<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class RateLimitType
{
    public const RAWREQUESTS = 0;
    public const CONNECTIONS = 1;
    public const REQUESTWEIGHT = 2;
    public const ORDERS = 3;
    public const NONREPRESENTABLE = 254;
    public const NULL_VALUE = 255;

    public static function encodedLength(): int
    {
        return 1;
    }
}
