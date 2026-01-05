<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class MaxNumOrderAmendsFilter
{
    public const TEMPLATE_ID = 20;
    public const SCHEMA_ID = 3;
    public const SCHEMA_VERSION = 2;
    public const BLOCK_LENGTH = 8;

    public int|float|array|null $filterType = null;
    public int|float|array|null $maxNumOrderAmends = null;

    public function encode(): string
    {
        $buffer = '';

        if ($this->maxNumOrderAmends !== null) {
            $buffer .= pack('q', $this->maxNumOrderAmends);
        }

        return $buffer;
    }

    public function decode(string $data): void
    {
        $offset = 0;

        $this->maxNumOrderAmends = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
    }
}
