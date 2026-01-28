<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class PriceTickerSymbolResponse
{
    public const TEMPLATE_ID = 209;
    public const SCHEMA_ID = 3;
    public const SCHEMA_VERSION = 1;
    public const BLOCK_LENGTH = 9;

    public int|float|array|null $priceExponent = null;
    public int|float|array|null $price = null;
    public string $symbol = '';

    private function decodeVarData(string $data, int &$offset): string
    {
        $length = unpack('V', substr($data, $offset, 4))[1];
        $offset += 4;
        $value = substr($data, $offset, $length);
        $offset += $length;
        return $value;
    }

    public function encode(): string
    {
        $buffer = '';

        if ($this->priceExponent !== null) {
            $buffer .= pack('c', $this->priceExponent);
        }
        if ($this->price !== null) {
            $buffer .= pack('q', $this->price);
        }

        return $buffer;
    }

    public function decode(string $data): void
    {
        $offset = 0;

        $this->priceExponent = unpack('c', substr($data, $offset, 1))[1];
        $offset += 1;
        $this->price = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;

        // Skip to end of block for forward compatibility
        $offset = 9;


        $this->symbol = $this->decodeVarData($data, $offset);
    }
}
