<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class Orders
{
    public int|float|null $priceExponent = null;
    public int|float|null $qtyExponent = null;
    public int|float|null $orderId = null;
    public int|float|null $orderListId = null;
    public int|float|null $price = null;
    public int|float|null $origQty = null;
    public int|float|null $executedQty = null;
    public int|float|null $cummulativeQuoteQty = null;
    public int|float|null $stopPrice = null;
    public int|float|null $trailingDelta = null;
    public int|float|null $trailingTime = null;
    public int|float|null $icebergQty = null;
    public int|float|null $time = null;
    public int|float|null $updateTime = null;
    public int|float|null $workingTime = null;
    public int|float|null $origQuoteOrderQty = null;
    public int|float|null $strategyId = null;
    public int|float|null $strategyType = null;
    public int|float|null $preventedMatchId = null;
    public int|float|null $preventedQuantity = null;
    public int|float|null $pegOffsetValue = null;
    public int|float|null $peggedPrice = null;
}

class OrdersResponse
{
    public const TEMPLATE_ID = 308;
    public const SCHEMA_ID = 3;
    public const SCHEMA_VERSION = 1;
    public const BLOCK_LENGTH = 0;

    public array $orders = [];

    private function decodeOrdersGroup(string $data, int &$offset): array
    {
        $blockLength = unpack('v', substr($data, $offset, 2))[1];
        $offset += 2;
        $numInGroup = unpack('V', substr($data, $offset, 4))[1];
        $offset += 4;

        $items = [];
        for ($i = 0; $i < $numInGroup; $i++) {
            $itemStart = $offset;
            $item = new Orders();

            $item->priceExponent = unpack('c', substr($data, $offset, 1))[1];
            $offset += 1;
            $item->qtyExponent = unpack('c', substr($data, $offset, 1))[1];
            $offset += 1;
            $item->orderId = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->orderListId = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->price = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->origQty = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->executedQty = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->cummulativeQuoteQty = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->stopPrice = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->trailingDelta = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->trailingTime = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->icebergQty = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->time = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->updateTime = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->workingTime = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->origQuoteOrderQty = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->strategyId = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->strategyType = unpack('l', substr($data, $offset, 4))[1];
            $offset += 4;
            $item->preventedMatchId = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->preventedQuantity = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->pegOffsetValue = unpack('C', substr($data, $offset, 1))[1];
            $offset += 1;
            $item->peggedPrice = unpack('q', substr($data, $offset, 8))[1];
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

        $this->orders = $this->decodeOrdersGroup($data, $offset);
    }
}
