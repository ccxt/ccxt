<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class MaxNumIcebergOrdersFilter
{
    public const TEMPLATE_ID = 11;
    public const SCHEMA_ID = 3;
    public const SCHEMA_VERSION = 2;
    public const BLOCK_LENGTH = 8;

    public int|float|array|null $filterType = null;
    public int|float|array|null $maxNumIcebergOrders = null;

    public function encode(): string
    {
        $buffer = '';

        if ($this->maxNumIcebergOrders !== null) {
            $buffer .= pack('q', $this->maxNumIcebergOrders);
        }

        return $buffer;
    }

    public function decode(string $data): void
    {
        $offset = 0;

        $this->maxNumIcebergOrders = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;

        // Skip to end of block for forward compatibility
        $offset = 8;

    }
}
