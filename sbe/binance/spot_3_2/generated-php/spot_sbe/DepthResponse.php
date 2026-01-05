<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class DepthResponse
{
    public const TEMPLATE_ID = 200;
    public const SCHEMA_ID = 3;
    public const SCHEMA_VERSION = 2;
    public const BLOCK_LENGTH = 10;

    public int|float|array|null $lastUpdateId = null;
    public int|float|array|null $priceExponent = null;
    public int|float|array|null $qtyExponent = null;
    public array $bids = [];
    public array $asks = [];

    public function encode(): string
    {
        $buffer = '';

        if ($this->lastUpdateId !== null) {
            $buffer .= pack('q', $this->lastUpdateId);
        }
        if ($this->priceExponent !== null) {
            $buffer .= pack('c', $this->priceExponent);
        }
        if ($this->qtyExponent !== null) {
            $buffer .= pack('c', $this->qtyExponent);
        }

        return $buffer;
    }

    public function decode(string $data): void
    {
        $offset = 0;

        $this->lastUpdateId = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->priceExponent = unpack('c', substr($data, $offset, 1))[1];
        $offset += 1;
        $this->qtyExponent = unpack('c', substr($data, $offset, 1))[1];
        $offset += 1;
    }
}
