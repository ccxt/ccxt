<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class Subscriptions
{
    public int|float|null $subscriptionId = null;
    public int|float|null $expirationTime = null;
}

class WebSocketSessionSubscriptionsResponse
{
    public const TEMPLATE_ID = 54;
    public const SCHEMA_ID = 3;
    public const SCHEMA_VERSION = 2;
    public const BLOCK_LENGTH = 0;

    public array $subscriptions = [];

    private function decodeSubscriptionsGroup(string $data, int &$offset): array
    {
        $blockLength = unpack('v', substr($data, $offset, 2))[1];
        $offset += 2;
        $numInGroup = unpack('V', substr($data, $offset, 4))[1];
        $offset += 4;

        $items = [];
        for ($i = 0; $i < $numInGroup; $i++) {
            $itemStart = $offset;
            $item = new Subscriptions();

            $item->subscriptionId = unpack('v', substr($data, $offset, 2))[1];
            $offset += 2;
            $item->expirationTime = unpack('q', substr($data, $offset, 8))[1];
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

        $this->subscriptions = $this->decodeSubscriptionsGroup($data, $offset);
    }
}
