<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class UnlockData
{
    public int|float|null $unlockTime = null;
    public int|float|null $qty = null;
}

class TPlusFilterLockEvent
{
    public const TEMPLATE_ID = 608;
    public const SCHEMA_ID = 3;
    public const SCHEMA_VERSION = 2;
    public const BLOCK_LENGTH = 11;

    public int|float|array|null $eventTime = null;
    public int|float|array|null $qtyExponent = null;
    public int|float|array|null $subscriptionId = null;
    public array $unlockData = [];
    public string $symbol = '';
    public string $baseAsset = '';

    private function decodeUnlockDataGroup(string $data, int &$offset): array
    {
        $blockLength = unpack('v', substr($data, $offset, 2))[1];
        $offset += 2;
        $numInGroup = unpack('V', substr($data, $offset, 4))[1];
        $offset += 4;

        $items = [];
        for ($i = 0; $i < $numInGroup; $i++) {
            $itemStart = $offset;
            $item = new UnlockData();

            $item->unlockTime = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->qty = unpack('q', substr($data, $offset, 8))[1];
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

        if ($this->eventTime !== null) {
            $buffer .= pack('q', $this->eventTime);
        }
        if ($this->qtyExponent !== null) {
            $buffer .= pack('c', $this->qtyExponent);
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
        $this->qtyExponent = unpack('c', substr($data, $offset, 1))[1];
        $offset += 1;
        $this->subscriptionId = unpack('v', substr($data, $offset, 2))[1];
        $offset += 2;

        // Skip to end of block for forward compatibility
        $offset = 11;

        $this->unlockData = $this->decodeUnlockDataGroup($data, $offset);

        $this->symbol = $this->decodeVarData($data, $offset);
        $this->baseAsset = $this->decodeVarData($data, $offset);
    }
}
