<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class MaxNumOrderListsFilter
{
    public const TEMPLATE_ID = 18;
    public const SCHEMA_ID = 3;
    public const SCHEMA_VERSION = 2;
    public const BLOCK_LENGTH = 8;

    public int|float|array|null $filterType = null;
    public int|float|array|null $maxNumOrderLists = null;

    public function encode(): string
    {
        $buffer = '';

        if ($this->maxNumOrderLists !== null) {
            $buffer .= pack('q', $this->maxNumOrderLists);
        }

        return $buffer;
    }

    public function decode(string $data): void
    {
        $offset = 0;

        $this->maxNumOrderLists = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
    }
}
