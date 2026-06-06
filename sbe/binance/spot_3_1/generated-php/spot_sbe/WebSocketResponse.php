<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class RateLimits
{
    public int|float|null $intervalNum = null;
    public int|float|null $rateLimit = null;
    public int|float|null $current = null;
}

class WebSocketResponse
{
    public const TEMPLATE_ID = 50;
    public const SCHEMA_ID = 3;
    public const SCHEMA_VERSION = 1;
    public const BLOCK_LENGTH = 3;

    public int|float|array|null $sbeSchemaIdVersionDeprecated = null;
    public int|float|array|null $status = null;
    public array $rateLimits = [];
    public string $id = '';
    public string $result = '';

    private function decodeRateLimitsGroup(string $data, int &$offset): array
    {
        $blockLength = unpack('v', substr($data, $offset, 2))[1];
        $offset += 2;
        $numInGroup = unpack('v', substr($data, $offset, 2))[1];
        $offset += 2;

        $items = [];
        for ($i = 0; $i < $numInGroup; $i++) {
            $itemStart = $offset;
            $item = new RateLimits();

            $item->intervalNum = unpack('C', substr($data, $offset, 1))[1];
            $offset += 1;
            $item->rateLimit = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->current = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;

            // Skip to next block for forward compatibility
            $offset = $itemStart + $blockLength;
            $items[] = $item;
        }

        return $items;
    }

    private function decodeVarData(string $data, int &$offset): string
    {
        $length = unpack('V', substr($data, $offset, 4))[1];
        $offset += 4;
        $value = substr($data, $offset, $length);
        $offset += $length;
        return $value;
    }

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

        // Skip to end of block for forward compatibility
        $offset = 3;

        $this->rateLimits = $this->decodeRateLimitsGroup($data, $offset);

        $this->id = $this->decodeVarData($data, $offset);
        $this->result = $this->decodeVarData($data, $offset);
    }
}
