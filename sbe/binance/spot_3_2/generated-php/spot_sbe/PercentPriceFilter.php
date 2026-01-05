<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class PercentPriceFilter
{
    public const TEMPLATE_ID = 2;
    public const SCHEMA_ID = 3;
    public const SCHEMA_VERSION = 2;
    public const BLOCK_LENGTH = 21;

    public int|float|array|null $filterType = null;
    public int|float|array|null $multiplierExponent = null;
    public int|float|array|null $multiplierUp = null;
    public int|float|array|null $multiplierDown = null;
    public int|float|array|null $avgPriceMins = null;

    public function encode(): string
    {
        $buffer = '';

        if ($this->multiplierExponent !== null) {
            $buffer .= pack('c', $this->multiplierExponent);
        }
        if ($this->multiplierUp !== null) {
            $buffer .= pack('q', $this->multiplierUp);
        }
        if ($this->multiplierDown !== null) {
            $buffer .= pack('q', $this->multiplierDown);
        }
        if ($this->avgPriceMins !== null) {
            $buffer .= pack('l', $this->avgPriceMins);
        }

        return $buffer;
    }

    public function decode(string $data): void
    {
        $offset = 0;

        $this->multiplierExponent = unpack('c', substr($data, $offset, 1))[1];
        $offset += 1;
        $this->multiplierUp = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->multiplierDown = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->avgPriceMins = unpack('l', substr($data, $offset, 4))[1];
        $offset += 4;
    }
}
