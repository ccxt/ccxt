<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class SymbolStatus
{
    public const TRADING = 0;
    public const ENDOFDAY = 1;
    public const HALT = 2;
    public const BREAK = 3;
    public const NONREPRESENTABLE = 254;
    public const NULL_VALUE = 255;

    public static function encodedLength(): int
    {
        return 1;
    }
}
