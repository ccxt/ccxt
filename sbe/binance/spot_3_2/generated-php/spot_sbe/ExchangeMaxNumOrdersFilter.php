<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class ExchangeMaxNumOrdersFilter
{
    public const TEMPLATE_ID = 15;
    public const SCHEMA_ID = 3;
    public const SCHEMA_VERSION = 2;
    public const BLOCK_LENGTH = 8;

    public int|float|array|null $filterType = null;
    public int|float|array|null $maxNumOrders = null;

    public function encode(): string
    {
        $buffer = '';

        if ($this->maxNumOrders !== null) {
            $buffer .= pack('q', $this->maxNumOrders);
        }

        return $buffer;
    }

    public function decode(string $data): void
    {
        $offset = 0;

        $this->maxNumOrders = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;

        // Skip to end of block for forward compatibility
        $offset = 8;

    }
}
