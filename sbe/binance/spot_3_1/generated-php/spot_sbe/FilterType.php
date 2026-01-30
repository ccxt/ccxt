<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class FilterType
{
    public const MAXPOSITION = 0;
    public const PRICEFILTER = 1;
    public const TPLUSSELL = 2;
    public const LOTSIZE = 3;
    public const MAXNUMORDERS = 4;
    public const MINNOTIONAL = 5;
    public const MAXNUMALGOORDERS = 6;
    public const EXCHANGEMAXNUMORDERS = 7;
    public const EXCHANGEMAXNUMALGOORDERS = 8;
    public const ICEBERGPARTS = 9;
    public const MARKETLOTSIZE = 10;
    public const PERCENTPRICE = 11;
    public const MAXNUMICEBERGORDERS = 12;
    public const EXCHANGEMAXNUMICEBERGORDERS = 13;
    public const TRAILINGDELTA = 14;
    public const PERCENTPRICEBYSIDE = 15;
    public const NOTIONAL = 16;
    public const MAXNUMORDERLISTS = 17;
    public const EXCHANGEMAXNUMORDERLISTS = 18;
    public const MAXNUMORDERAMENDS = 19;
    public const MAXASSET = 20;
    public const NONREPRESENTABLE = 254;
    public const NULL_VALUE = 255;

    public static function encodedLength(): int
    {
        return 1;
    }
}
