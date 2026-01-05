<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class WebSocketResponse
{
    public const TEMPLATE_ID = 50;
    public const SCHEMA_ID = 3;
    public const SCHEMA_VERSION = 2;
    public const BLOCK_LENGTH = 3;

    public int|float|array|null $sbeSchemaIdVersionDeprecated = null;
    public int|float|array|null $status = null;
    public array $rateLimits = [];
    public string $id = '';
    public string $result = '';

    public function encode(): string
    {
        $buffer = '';

        if ($this->status !== null) {
            $buffer .= pack('v', $this->status);
        }

        return $buffer;
    }

    public function decode(string $data): void
    {
        $offset = 0;

        $this->status = unpack('v', substr($data, $offset, 2))[1];
        $offset += 2;
    }
}
