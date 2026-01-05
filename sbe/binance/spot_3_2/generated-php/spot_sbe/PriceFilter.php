<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class PriceFilter
{
    public const TEMPLATE_ID = 1;
    public const SCHEMA_ID = 3;
    public const SCHEMA_VERSION = 2;
    public const BLOCK_LENGTH = 25;

    public int|float|array|null $filterType = null;
    public int|float|array|null $priceExponent = null;
    public int|float|array|null $minPrice = null;
    public int|float|array|null $maxPrice = null;
    public int|float|array|null $tickSize = null;

    public function encode(): string
    {
        $buffer = '';

        if ($this->priceExponent !== null) {
            $buffer .= pack('c', $this->priceExponent);
        }
        if ($this->minPrice !== null) {
            $buffer .= pack('q', $this->minPrice);
        }
        if ($this->maxPrice !== null) {
            $buffer .= pack('q', $this->maxPrice);
        }
        if ($this->tickSize !== null) {
            $buffer .= pack('q', $this->tickSize);
        }

        return $buffer;
    }

    public function decode(string $data): void
    {
        $offset = 0;

        $this->priceExponent = unpack('c', substr($data, $offset, 1))[1];
        $offset += 1;
        $this->minPrice = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->maxPrice = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->tickSize = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
    }
}
