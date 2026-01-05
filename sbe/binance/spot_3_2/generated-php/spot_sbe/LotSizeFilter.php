<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class LotSizeFilter
{
    public const TEMPLATE_ID = 4;
    public const SCHEMA_ID = 3;
    public const SCHEMA_VERSION = 2;
    public const BLOCK_LENGTH = 25;

    public int|float|array|null $filterType = null;
    public int|float|array|null $qtyExponent = null;
    public int|float|array|null $minQty = null;
    public int|float|array|null $maxQty = null;
    public int|float|array|null $stepSize = null;

    public function encode(): string
    {
        $buffer = '';

        if ($this->qtyExponent !== null) {
            $buffer .= pack('c', $this->qtyExponent);
        }
        if ($this->minQty !== null) {
            $buffer .= pack('q', $this->minQty);
        }
        if ($this->maxQty !== null) {
            $buffer .= pack('q', $this->maxQty);
        }
        if ($this->stepSize !== null) {
            $buffer .= pack('q', $this->stepSize);
        }

        return $buffer;
    }

    public function decode(string $data): void
    {
        $offset = 0;

        $this->qtyExponent = unpack('c', substr($data, $offset, 1))[1];
        $offset += 1;
        $this->minQty = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->maxQty = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->stepSize = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
    }
}
