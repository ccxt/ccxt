<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class CancelReplaceStatus
{
    public const SUCCESS = 0;
    public const FAILURE = 1;
    public const NOTATTEMPTED = 2;
    public const NONREPRESENTABLE = 254;
    public const NULL_VALUE = 255;

    public static function encodedLength(): int
    {
        return 1;
    }
}
