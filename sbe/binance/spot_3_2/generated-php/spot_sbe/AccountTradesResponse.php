<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class Trades
{
    public int|float|null $priceExponent = null;
    public int|float|null $qtyExponent = null;
    public int|float|null $commissionExponent = null;
    public int|float|null $id = null;
    public int|float|null $orderId = null;
    public int|float|null $orderListId = null;
    public int|float|null $price = null;
    public int|float|null $qty = null;
    public int|float|null $quoteQty = null;
    public int|float|null $commission = null;
    public int|float|null $time = null;
}

class AccountTradesResponse
{
    public const TEMPLATE_ID = 401;
    public const SCHEMA_ID = 3;
    public const SCHEMA_VERSION = 2;
    public const BLOCK_LENGTH = 0;

    public array $trades = [];

    private function decodeTradesGroup(string $data, int &$offset): array
    {
        $blockLength = unpack('v', substr($data, $offset, 2))[1];
        $offset += 2;
        $numInGroup = unpack('V', substr($data, $offset, 4))[1];
        $offset += 4;

        $items = [];
        for ($i = 0; $i < $numInGroup; $i++) {
            $itemStart = $offset;
            $item = new Trades();

            $item->priceExponent = unpack('c', substr($data, $offset, 1))[1];
            $offset += 1;
            $item->qtyExponent = unpack('c', substr($data, $offset, 1))[1];
            $offset += 1;
            $item->commissionExponent = unpack('c', substr($data, $offset, 1))[1];
            $offset += 1;
            $item->id = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->orderId = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->orderListId = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->price = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->qty = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->quoteQty = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->commission = unpack('q', substr($data, $offset, 8))[1];
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


        return $buffer;
    }

    public function decode(string $data): void
    {
        $offset = 0;


        // Skip to end of block for forward compatibility
        $offset = 0;

        $this->trades = $this->decodeTradesGroup($data, $offset);
    }
}
