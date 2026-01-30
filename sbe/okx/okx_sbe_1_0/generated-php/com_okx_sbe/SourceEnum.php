<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class SourceEnum
{
    public const NORMAL = 0;
    public const ELP = 1;
    public const NULL_VALUE = -128;

    public static function encodedLength(): int
    {
        return 1;
    }
}
