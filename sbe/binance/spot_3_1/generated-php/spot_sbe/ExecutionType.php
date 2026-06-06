<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class ExecutionType
{
    public const NEW = 0;
    public const CANCELED = 1;
    public const REPLACED = 2;
    public const REJECTED = 3;
    public const TRADE = 4;
    public const EXPIRED = 5;
    public const TRADEPREVENTION = 8;
    public const UNKNOWN = 253;
    public const NONREPRESENTABLE = 254;
    public const NULL_VALUE = 255;

    public static function encodedLength(): int
    {
        return 1;
    }
}
