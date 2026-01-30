<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class ListOrderStatus
{
    public const CANCELING = 0;
    public const EXECUTING = 1;
    public const ALLDONE = 2;
    public const REJECT = 3;
    public const NONREPRESENTABLE = 254;
    public const NULL_VALUE = 255;

    public static function encodedLength(): int
    {
        return 1;
    }
}
