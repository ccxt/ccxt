<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class RateLimits
{
    public int|float|null $intervalNum = null;
    public int|float|null $rateLimit = null;
    public int|float|null $numOrders = null;
}

class AccountOrderRateLimitResponse
{
    public const TEMPLATE_ID = 402;
    public const SCHEMA_ID = 3;
    public const SCHEMA_VERSION = 1;
    public const BLOCK_LENGTH = 0;

    public array $rateLimits = [];

    private function decodeRateLimitsGroup(string $data, int &$offset): array
    {
        $blockLength = unpack('v', substr($data, $offset, 2))[1];
        $offset += 2;
        $numInGroup = unpack('V', substr($data, $offset, 4))[1];
        $offset += 4;

        $items = [];
        for ($i = 0; $i < $numInGroup; $i++) {
            $itemStart = $offset;
            $item = new RateLimits();

            $item->intervalNum = unpack('C', substr($data, $offset, 1))[1];
            $offset += 1;
            $item->rateLimit = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->numOrders = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;

            // Skip to next block for forward compatibility
            $offset = $itemStart + $blockLength;
            $items[] = $item;
        }

        return $items;
    }

    public function encode(): string
    {
        $buffer = '';


        return $buffer;
    }

    public function decode(string $data): void
    {
        $offset = 0;


        // Skip to end of block for forward compatibility
        $offset = 0;

        $this->rateLimits = $this->decodeRateLimitsGroup($data, $offset);
    }
}
