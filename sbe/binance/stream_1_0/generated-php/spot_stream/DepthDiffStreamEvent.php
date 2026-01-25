<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class Bids
{
    public int|float|null $price = null;
    public int|float|null $qty = null;
}

class Asks
{
    public int|float|null $price = null;
    public int|float|null $qty = null;
}

class DepthDiffStreamEvent
{
    public const TEMPLATE_ID = 10003;
    public const SCHEMA_ID = 1;
    public const SCHEMA_VERSION = 0;
    public const BLOCK_LENGTH = 26;

    public int|float|array|null $eventTime = null;
    public int|float|array|null $firstBookUpdateId = null;
    public int|float|array|null $lastBookUpdateId = null;
    public int|float|array|null $priceExponent = null;
    public int|float|array|null $qtyExponent = null;
    public array $bids = [];
    public array $asks = [];
    public string $symbol = '';

    private function decodeBidsGroup(string $data, int &$offset): array
    {
        $blockLength = unpack('v', substr($data, $offset, 2))[1];
        $offset += 2;
        $numInGroup = unpack('v', substr($data, $offset, 2))[1];
        $offset += 2;

        $items = [];
        for ($i = 0; $i < $numInGroup; $i++) {
            $itemStart = $offset;
            $item = new Bids();

            $item->price = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->qty = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;

            // Skip to next block for forward compatibility
            $offset = $itemStart + $blockLength;
            $items[] = $item;
        }

        return $items;
    }

    private function decodeAsksGroup(string $data, int &$offset): array
    {
        $blockLength = unpack('v', substr($data, $offset, 2))[1];
        $offset += 2;
        $numInGroup = unpack('v', substr($data, $offset, 2))[1];
        $offset += 2;

        $items = [];
        for ($i = 0; $i < $numInGroup; $i++) {
            $itemStart = $offset;
            $item = new Asks();

            $item->price = unpack('q', substr($data, $offset, 8))[1];
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
        if ($this->firstBookUpdateId !== null) {
            $buffer .= pack('q', $this->firstBookUpdateId);
        }
        if ($this->lastBookUpdateId !== null) {
            $buffer .= pack('q', $this->lastBookUpdateId);
        }
        if ($this->priceExponent !== null) {
            $buffer .= pack('c', $this->priceExponent);
        }
        if ($this->qtyExponent !== null) {
            $buffer .= pack('c', $this->qtyExponent);
        }

        return $buffer;
    }

    public function decode(string $data): void
    {
        $offset = 0;

        $this->eventTime = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->firstBookUpdateId = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->lastBookUpdateId = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->priceExponent = unpack('c', substr($data, $offset, 1))[1];
        $offset += 1;
        $this->qtyExponent = unpack('c', substr($data, $offset, 1))[1];
        $offset += 1;

        // Skip to end of block for forward compatibility
        $offset = 26;

        $this->bids = $this->decodeBidsGroup($data, $offset);
        $this->asks = $this->decodeAsksGroup($data, $offset);

        $this->symbol = $this->decodeVarData($data, $offset);
    }
}
