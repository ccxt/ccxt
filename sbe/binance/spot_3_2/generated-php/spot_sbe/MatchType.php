<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class MatchType
{
    public const AUTOMATCH = 1;
    public const ONEPARTYTRADEREPORT = 2;
    public const NONREPRESENTABLE = 254;
    public const NULL_VALUE = 255;

    public static function encodedLength(): int
    {
        return 1;
    }
}
