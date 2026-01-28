<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class OrderStatus
{
    public const NEW = 0;
    public const PARTIALLYFILLED = 1;
    public const FILLED = 2;
    public const CANCELED = 3;
    public const PENDINGCANCEL = 4;
    public const REJECTED = 5;
    public const EXPIRED = 6;
    public const EXPIREDINMATCH = 9;
    public const PENDINGNEW = 11;
    public const UNKNOWN = 253;
    public const NONREPRESENTABLE = 254;
    public const NULL_VALUE = 255;

    public static function encodedLength(): int
    {
        return 1;
    }
}
