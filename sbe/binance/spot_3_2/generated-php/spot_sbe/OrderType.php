<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class OrderType
{
    public const MARKET = 0;
    public const LIMIT = 1;
    public const STOPLOSS = 2;
    public const STOPLOSSLIMIT = 3;
    public const TAKEPROFIT = 4;
    public const TAKEPROFITLIMIT = 5;
    public const LIMITMAKER = 6;
    public const NONREPRESENTABLE = 254;
    public const NULL_VALUE = 255;

    public static function encodedLength(): int
    {
        return 1;
    }
}
