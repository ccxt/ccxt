<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class PercentPriceBySideFilter
{
    public const TEMPLATE_ID = 3;
    public const SCHEMA_ID = 3;
    public const SCHEMA_VERSION = 2;
    public const BLOCK_LENGTH = 37;

    public int|float|array|null $filterType = null;
    public int|float|array|null $multiplierExponent = null;
    public int|float|array|null $bidMultiplierUp = null;
    public int|float|array|null $bidMultiplierDown = null;
    public int|float|array|null $askMultiplierUp = null;
    public int|float|array|null $askMultiplierDown = null;
    public int|float|array|null $avgPriceMins = null;

    public function encode(): string
    {
        $buffer = '';

        if ($this->multiplierExponent !== null) {
            $buffer .= pack('c', $this->multiplierExponent);
        }
        if ($this->bidMultiplierUp !== null) {
            $buffer .= pack('q', $this->bidMultiplierUp);
        }
        if ($this->bidMultiplierDown !== null) {
            $buffer .= pack('q', $this->bidMultiplierDown);
        }
        if ($this->askMultiplierUp !== null) {
            $buffer .= pack('q', $this->askMultiplierUp);
        }
        if ($this->askMultiplierDown !== null) {
            $buffer .= pack('q', $this->askMultiplierDown);
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
        $this->bidMultiplierUp = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->bidMultiplierDown = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->askMultiplierUp = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->askMultiplierDown = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->avgPriceMins = unpack('l', substr($data, $offset, 4))[1];
        $offset += 4;
    }
}
