<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class MinNotionalFilter
{
    public const TEMPLATE_ID = 5;
    public const SCHEMA_ID = 3;
    public const SCHEMA_VERSION = 2;
    public const BLOCK_LENGTH = 14;

    public int|float|array|null $filterType = null;
    public int|float|array|null $priceExponent = null;
    public int|float|array|null $minNotional = null;
    public int|float|array|null $applyToMarket = null;
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
        $this->avgPriceMins = unpack('l', substr($data, $offset, 4))[1];
        $offset += 4;

        // Skip to end of block for forward compatibility
        $offset = 14;

    }
}
