<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class TPlusSellFilter
{
    public const TEMPLATE_ID = 14;
    public const SCHEMA_ID = 3;
    public const SCHEMA_VERSION = 2;
    public const BLOCK_LENGTH = 8;

    public int|float|array|null $filterType = null;
    public int|float|array|null $endTime = null;

    public function encode(): string
    {
        $buffer = '';

        if ($this->endTime !== null) {
            $buffer .= pack('q', $this->endTime);
        }

        return $buffer;
    }

    public function decode(string $data): void
    {
        $offset = 0;

        $this->endTime = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;

        // Skip to end of block for forward compatibility
        $offset = 8;

    }
}
