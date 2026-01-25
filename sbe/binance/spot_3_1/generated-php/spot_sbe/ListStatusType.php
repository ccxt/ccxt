<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class ListStatusType
{
    public const RESPONSE = 0;
    public const EXECSTARTED = 1;
    public const ALLDONE = 2;
    public const UPDATED = 3;
    public const NONREPRESENTABLE = 254;
    public const NULL_VALUE = 255;

    public static function encodedLength(): int
    {
        return 1;
    }
}
