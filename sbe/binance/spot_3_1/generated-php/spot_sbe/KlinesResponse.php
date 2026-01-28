<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class Klines
{
    public int|float|null $openTime = null;
    public int|float|null $openPrice = null;
    public int|float|null $highPrice = null;
    public int|float|null $lowPrice = null;
    public int|float|null $closePrice = null;
    public int|float|null $volume = null;
    public int|float|null $closeTime = null;
    public int|float|null $quoteVolume = null;
    public int|float|null $numTrades = null;
    public int|float|null $takerBuyBaseVolume = null;
    public int|float|null $takerBuyQuoteVolume = null;
}

class KlinesResponse
{
    public const TEMPLATE_ID = 203;
    public const SCHEMA_ID = 3;
    public const SCHEMA_VERSION = 1;
    public const BLOCK_LENGTH = 2;

    public int|float|array|null $priceExponent = null;
    public int|float|array|null $qtyExponent = null;
    public array $klines = [];

    private function decodeKlinesGroup(string $data, int &$offset): array
    {
        $blockLength = unpack('v', substr($data, $offset, 2))[1];
        $offset += 2;
        $numInGroup = unpack('V', substr($data, $offset, 4))[1];
        $offset += 4;

        $items = [];
        for ($i = 0; $i < $numInGroup; $i++) {
            $itemStart = $offset;
            $item = new Klines();

            $item->openTime = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->openPrice = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->highPrice = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->lowPrice = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->closePrice = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->volume = unpack('C', substr($data, $offset, 1))[1];
            $offset += 1;
            $item->closeTime = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->quoteVolume = unpack('C', substr($data, $offset, 1))[1];
            $offset += 1;
            $item->numTrades = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->takerBuyBaseVolume = unpack('C', substr($data, $offset, 1))[1];
            $offset += 1;
            $item->takerBuyQuoteVolume = unpack('C', substr($data, $offset, 1))[1];
            $offset += 1;

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

        $this->klines = $this->decodeKlinesGroup($data, $offset);
    }
}
