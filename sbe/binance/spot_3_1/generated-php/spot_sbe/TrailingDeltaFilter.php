<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class TrailingDeltaFilter
{
    public const TEMPLATE_ID = 13;
    public const SCHEMA_ID = 3;
    public const SCHEMA_VERSION = 1;
    public const BLOCK_LENGTH = 32;

    public int|float|array|null $filterType = null;
    public int|float|array|null $minTrailingAboveDelta = null;
    public int|float|array|null $maxTrailingAboveDelta = null;
    public int|float|array|null $minTrailingBelowDelta = null;
    public int|float|array|null $maxTrailingBelowDelta = null;

    public function encode(): string
    {
        $buffer = '';

        if ($this->minTrailingAboveDelta !== null) {
            $buffer .= pack('q', $this->minTrailingAboveDelta);
        }
        if ($this->maxTrailingAboveDelta !== null) {
            $buffer .= pack('q', $this->maxTrailingAboveDelta);
        }
        if ($this->minTrailingBelowDelta !== null) {
            $buffer .= pack('q', $this->minTrailingBelowDelta);
        }
        if ($this->maxTrailingBelowDelta !== null) {
            $buffer .= pack('q', $this->maxTrailingBelowDelta);
        }

        return $buffer;
    }

    public function decode(string $data): void
    {
        $offset = 0;

        $this->minTrailingAboveDelta = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->maxTrailingAboveDelta = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->minTrailingBelowDelta = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->maxTrailingBelowDelta = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;

        // Skip to end of block for forward compatibility
        $offset = 32;

    }
}
