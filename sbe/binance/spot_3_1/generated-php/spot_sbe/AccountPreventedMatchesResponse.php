<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class PreventedMatches
{
    public int|float|null $priceExponent = null;
    public int|float|null $qtyExponent = null;
    public int|float|null $preventedMatchId = null;
    public int|float|null $takerOrderId = null;
    public int|float|null $makerOrderId = null;
    public int|float|null $tradeGroupId = null;
    public int|float|null $price = null;
    public int|float|null $takerPreventedQuantity = null;
    public int|float|null $makerPreventedQuantity = null;
    public int|float|null $transactTime = null;
}

class AccountPreventedMatchesResponse
{
    public const TEMPLATE_ID = 403;
    public const SCHEMA_ID = 3;
    public const SCHEMA_VERSION = 1;
    public const BLOCK_LENGTH = 0;

    public array $preventedMatches = [];

    private function decodePreventedMatchesGroup(string $data, int &$offset): array
    {
        $blockLength = unpack('v', substr($data, $offset, 2))[1];
        $offset += 2;
        $numInGroup = unpack('V', substr($data, $offset, 4))[1];
        $offset += 4;

        $items = [];
        for ($i = 0; $i < $numInGroup; $i++) {
            $itemStart = $offset;
            $item = new PreventedMatches();

            $item->priceExponent = unpack('c', substr($data, $offset, 1))[1];
            $offset += 1;
            $item->qtyExponent = unpack('c', substr($data, $offset, 1))[1];
            $offset += 1;
            $item->preventedMatchId = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->takerOrderId = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->makerOrderId = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->tradeGroupId = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->price = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->takerPreventedQuantity = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->makerPreventedQuantity = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->transactTime = unpack('q', substr($data, $offset, 8))[1];
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

        $this->preventedMatches = $this->decodePreventedMatchesGroup($data, $offset);
    }
}
