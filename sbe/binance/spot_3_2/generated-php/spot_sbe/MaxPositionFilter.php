<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class MaxPositionFilter
{
    public const TEMPLATE_ID = 12;
    public const SCHEMA_ID = 3;
    public const SCHEMA_VERSION = 2;
    public const BLOCK_LENGTH = 9;

    public int|float|array|null $filterType = null;
    public int|float|array|null $qtyExponent = null;
    public int|float|array|null $maxPosition = null;

    public function encode(): string
    {
        $buffer = '';

        if ($this->qtyExponent !== null) {
            $buffer .= pack('c', $this->qtyExponent);
        }
        if ($this->maxPosition !== null) {
            $buffer .= pack('q', $this->maxPosition);
        }

        return $buffer;
    }

    public function decode(string $data): void
    {
        $offset = 0;

        $this->qtyExponent = unpack('c', substr($data, $offset, 1))[1];
        $offset += 1;
        $this->maxPosition = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;

        // Skip to end of block for forward compatibility
        $offset = 9;

    }
}
