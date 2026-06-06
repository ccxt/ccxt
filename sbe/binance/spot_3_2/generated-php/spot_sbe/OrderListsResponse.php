<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class OrderLists
{
    public int|float|null $orderListId = null;
    public int|float|null $transactionTime = null;
    public int|float|null $orderId = null;
}

class OrderListsResponse
{
    public const TEMPLATE_ID = 314;
    public const SCHEMA_ID = 3;
    public const SCHEMA_VERSION = 2;
    public const BLOCK_LENGTH = 0;

    public array $orderLists = [];

    private function decodeOrderListsGroup(string $data, int &$offset): array
    {
        $blockLength = unpack('v', substr($data, $offset, 2))[1];
        $offset += 2;
        $numInGroup = unpack('V', substr($data, $offset, 4))[1];
        $offset += 4;

        $items = [];
        for ($i = 0; $i < $numInGroup; $i++) {
            $itemStart = $offset;
            $item = new OrderLists();

            $item->orderListId = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->transactionTime = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->orderId = unpack('q', substr($data, $offset, 8))[1];
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

        $this->orderLists = $this->decodeOrderListsGroup($data, $offset);
    }
}
