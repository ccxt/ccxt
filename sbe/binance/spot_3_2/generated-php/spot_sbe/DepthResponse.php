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

class DepthResponse
{
    public const TEMPLATE_ID = 200;
    public const SCHEMA_ID = 3;
    public const SCHEMA_VERSION = 2;
    public const BLOCK_LENGTH = 10;

    public int|float|array|null $lastUpdateId = null;
    public int|float|array|null $priceExponent = null;
    public int|float|array|null $qtyExponent = null;
    public array $bids = [];
    public array $asks = [];

    private function decodeBidsGroup(string $data, int &$offset): array
    {
        $blockLength = unpack('v', substr($data, $offset, 2))[1];
        $offset += 2;
        $numInGroup = unpack('V', substr($data, $offset, 4))[1];
        $offset += 4;

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
        $numInGroup = unpack('V', substr($data, $offset, 4))[1];
        $offset += 4;

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

    public function encode(): string
    {
        $buffer = '';

        if ($this->lastUpdateId !== null) {
            $buffer .= pack('q', $this->lastUpdateId);
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

        $this->lastUpdateId = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->priceExponent = unpack('c', substr($data, $offset, 1))[1];
        $offset += 1;
        $this->qtyExponent = unpack('c', substr($data, $offset, 1))[1];
        $offset += 1;

        // Skip to end of block for forward compatibility
        $offset = 10;

        $this->bids = $this->decodeBidsGroup($data, $offset);
        $this->asks = $this->decodeAsksGroup($data, $offset);
    }
}
