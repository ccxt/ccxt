<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class NotionalFilter
{
    public const TEMPLATE_ID = 6;
    public const SCHEMA_ID = 3;
    public const SCHEMA_VERSION = 2;
    public const BLOCK_LENGTH = 23;

    public int|float|array|null $filterType = null;
    public int|float|array|null $priceExponent = null;
    public int|float|array|null $minNotional = null;
    public int|float|array|null $applyMinToMarket = null;
    public int|float|array|null $maxNotional = null;
    public int|float|array|null $applyMaxToMarket = null;
    public int|float|array|null $avgPriceMins = null;

    public function encode(): string
    {
        $buffer = '';

        if ($this->priceExponent !== null) {
            $buffer .= pack('c', $this->priceExponent);
        }
        if ($this->minNotional !== null) {
            $buffer .= pack('q', $this->minNotional);
        }
        if ($this->maxNotional !== null) {
            $buffer .= pack('q', $this->maxNotional);
        }
        if ($this->avgPriceMins !== null) {
            $buffer .= pack('l', $this->avgPriceMins);
        }

        return $buffer;
    }

    public function decode(string $data): void
    {
        $offset = 0;

        $this->priceExponent = unpack('c', substr($data, $offset, 1))[1];
        $offset += 1;
        $this->minNotional = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->maxNotional = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->avgPriceMins = unpack('l', substr($data, $offset, 4))[1];
        $offset += 4;
    }
}
