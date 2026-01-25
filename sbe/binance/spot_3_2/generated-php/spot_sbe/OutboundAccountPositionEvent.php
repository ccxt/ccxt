<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class Balances
{
    public int|float|null $exponent = null;
    public int|float|null $free = null;
    public int|float|null $locked = null;
}

class OutboundAccountPositionEvent
{
    public const TEMPLATE_ID = 607;
    public const SCHEMA_ID = 3;
    public const SCHEMA_VERSION = 2;
    public const BLOCK_LENGTH = 18;

    public int|float|array|null $eventTime = null;
    public int|float|array|null $updateTime = null;
    public int|float|array|null $subscriptionId = null;
    public array $balances = [];

    private function decodeBalancesGroup(string $data, int &$offset): array
    {
        $blockLength = unpack('v', substr($data, $offset, 2))[1];
        $offset += 2;
        $numInGroup = unpack('V', substr($data, $offset, 4))[1];
        $offset += 4;

        $items = [];
        for ($i = 0; $i < $numInGroup; $i++) {
            $itemStart = $offset;
            $item = new Balances();

            $item->exponent = unpack('c', substr($data, $offset, 1))[1];
            $offset += 1;
            $item->free = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->locked = unpack('q', substr($data, $offset, 8))[1];
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

        if ($this->eventTime !== null) {
            $buffer .= pack('q', $this->eventTime);
        }
        if ($this->updateTime !== null) {
            $buffer .= pack('q', $this->updateTime);
        }
        if ($this->subscriptionId !== null) {
            $buffer .= pack('v', $this->subscriptionId);
        }

        return $buffer;
    }

    public function decode(string $data): void
    {
        $offset = 0;

        $this->eventTime = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->updateTime = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->subscriptionId = unpack('v', substr($data, $offset, 2))[1];
        $offset += 2;

        // Skip to end of block for forward compatibility
        $offset = 18;

        $this->balances = $this->decodeBalancesGroup($data, $offset);
    }
}
