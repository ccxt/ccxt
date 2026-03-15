<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class AggTrades
{
    public int|float|null $aggTradeId = null;
    public int|float|null $price = null;
    public int|float|null $qty = null;
    public int|float|null $firstTradeId = null;
    public int|float|null $lastTradeId = null;
    public int|float|null $time = null;
}

class AggTradesResponse
{
    public const TEMPLATE_ID = 202;
    public const SCHEMA_ID = 3;
    public const SCHEMA_VERSION = 1;
    public const BLOCK_LENGTH = 2;

    public int|float|array|null $priceExponent = null;
    public int|float|array|null $qtyExponent = null;
    public array $aggTrades = [];

    private function decodeAggTradesGroup(string $data, int &$offset): array
    {
        $blockLength = unpack('v', substr($data, $offset, 2))[1];
        $offset += 2;
        $numInGroup = unpack('V', substr($data, $offset, 4))[1];
        $offset += 4;

        $items = [];
        for ($i = 0; $i < $numInGroup; $i++) {
            $itemStart = $offset;
            $item = new AggTrades();

            $item->aggTradeId = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->price = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->qty = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->firstTradeId = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->lastTradeId = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->time = unpack('q', substr($data, $offset, 8))[1];
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

        $this->priceExponent = unpack('c', substr($data, $offset, 1))[1];
        $offset += 1;
        $this->qtyExponent = unpack('c', substr($data, $offset, 1))[1];
        $offset += 1;

        // Skip to end of block for forward compatibility
        $offset = 2;

        $this->aggTrades = $this->decodeAggTradesGroup($data, $offset);
    }
}
