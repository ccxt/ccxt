<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class Tickers
{
    public int|float|null $priceExponent = null;
    public int|float|null $qtyExponent = null;
    public int|float|null $bidPrice = null;
    public int|float|null $bidQty = null;
    public int|float|null $askPrice = null;
    public int|float|null $askQty = null;
}

class BookTickerResponse
{
    public const TEMPLATE_ID = 212;
    public const SCHEMA_ID = 3;
    public const SCHEMA_VERSION = 1;
    public const BLOCK_LENGTH = 0;

    public array $tickers = [];

    private function decodeTickersGroup(string $data, int &$offset): array
    {
        $blockLength = unpack('v', substr($data, $offset, 2))[1];
        $offset += 2;
        $numInGroup = unpack('V', substr($data, $offset, 4))[1];
        $offset += 4;

        $items = [];
        for ($i = 0; $i < $numInGroup; $i++) {
            $itemStart = $offset;
            $item = new Tickers();

            $item->priceExponent = unpack('c', substr($data, $offset, 1))[1];
            $offset += 1;
            $item->qtyExponent = unpack('c', substr($data, $offset, 1))[1];
            $offset += 1;
            $item->bidPrice = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->bidQty = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->askPrice = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->askQty = unpack('q', substr($data, $offset, 8))[1];
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

        $this->tickers = $this->decodeTickersGroup($data, $offset);
    }
}
