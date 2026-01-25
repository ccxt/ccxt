<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class ServerTimeResponse
{
    public const TEMPLATE_ID = 102;
    public const SCHEMA_ID = 3;
    public const SCHEMA_VERSION = 1;
    public const BLOCK_LENGTH = 8;

    public int|float|array|null $serverTime = null;

    public function encode(): string
    {
        $buffer = '';

        if ($this->serverTime !== null) {
            $buffer .= pack('q', $this->serverTime);
        }

        return $buffer;
    }

    public function decode(string $data): void
    {
        $offset = 0;

        $this->serverTime = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;

        // Skip to end of block for forward compatibility
        $offset = 8;

    }
}
