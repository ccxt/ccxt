<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class BookTickerSymbolResponse
{
    public const TEMPLATE_ID = 211;
    public const SCHEMA_ID = 3;
    public const SCHEMA_VERSION = 2;
    public const BLOCK_LENGTH = 34;

    public int|float|array|null $priceExponent = null;
    public int|float|array|null $qtyExponent = null;
    public int|float|array|null $bidPrice = null;
    public int|float|array|null $bidQty = null;
    public int|float|array|null $askPrice = null;
    public int|float|array|null $askQty = null;
    public string $symbol = '';

    public function encode(): string
    {
        $buffer = '';

        if ($this->priceExponent !== null) {
            $buffer .= pack('c', $this->priceExponent);
        }
        if ($this->qtyExponent !== null) {
            $buffer .= pack('c', $this->qtyExponent);
        }
        if ($this->bidPrice !== null) {
            $buffer .= pack('q', $this->bidPrice);
        }
        if ($this->bidQty !== null) {
            $buffer .= pack('q', $this->bidQty);
        }
        if ($this->askPrice !== null) {
            $buffer .= pack('q', $this->askPrice);
        }
        if ($this->askQty !== null) {
            $buffer .= pack('q', $this->askQty);
        }

        return $buffer;
    }

    public function decode(string $data): void
    {
        $offset = 0;

        $this->priceExponent = unpack('c', substr($data, $offset, 1))[1];
        $offset += 1;
        $this->qtyExponent = unpack('c', substr($data, $offset, 1))[1];
        $offset += 1;
        $this->bidPrice = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->bidQty = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->askPrice = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->askQty = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
    }
}
