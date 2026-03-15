<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class Orders
{
    public int|float|null $orderId = null;
}

class OrderReports
{
    public int|float|null $orderId = null;
    public int|float|null $orderListId = null;
    public int|float|null $transactTime = null;
    public int|float|null $price = null;
    public int|float|null $origQty = null;
    public int|float|null $executedQty = null;
    public int|float|null $cummulativeQuoteQty = null;
    public int|float|null $stopPrice = null;
    public int|float|null $trailingDelta = null;
    public int|float|null $trailingTime = null;
    public int|float|null $workingTime = null;
    public int|float|null $icebergQty = null;
    public int|float|null $strategyId = null;
    public int|float|null $strategyType = null;
    public int|float|null $tradeGroupId = null;
    public int|float|null $preventedQuantity = null;
    public int|float|null $origQuoteOrderQty = null;
    public int|float|null $pegOffsetValue = null;
    public int|float|null $peggedPrice = null;
}

class NewOrderListResultResponse
{
    public const TEMPLATE_ID = 310;
    public const SCHEMA_ID = 3;
    public const SCHEMA_VERSION = 1;
    public const BLOCK_LENGTH = 21;

    public int|float|array|null $orderListId = null;
    public int|float|array|null $contingencyType = null;
    public int|float|array|null $listStatusType = null;
    public int|float|array|null $listOrderStatus = null;
    public int|float|array|null $transactionTime = null;
    public int|float|array|null $priceExponent = null;
    public int|float|array|null $qtyExponent = null;
    public array $orders = [];
    public array $orderReports = [];
    public string $listClientOrderId = '';
    public string $symbol = '';

    private function decodeOrdersGroup(string $data, int &$offset): array
    {
        $blockLength = unpack('v', substr($data, $offset, 2))[1];
        $offset += 2;
        $numInGroup = unpack('v', substr($data, $offset, 2))[1];
        $offset += 2;

        $items = [];
        for ($i = 0; $i < $numInGroup; $i++) {
            $itemStart = $offset;
            $item = new Orders();

            $item->orderId = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;

            // Skip to next block for forward compatibility
            $offset = $itemStart + $blockLength;
            $items[] = $item;
        }

        return $items;
    }

    private function decodeOrderReportsGroup(string $data, int &$offset): array
    {
        $blockLength = unpack('v', substr($data, $offset, 2))[1];
        $offset += 2;
        $numInGroup = unpack('v', substr($data, $offset, 2))[1];
        $offset += 2;

        $items = [];
        for ($i = 0; $i < $numInGroup; $i++) {
            $itemStart = $offset;
            $item = new OrderReports();

            $item->orderId = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->orderListId = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->transactTime = unpack('q', substr($data, $offset, 8))[1];
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
            $item->workingTime = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->icebergQty = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->strategyId = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->strategyType = unpack('l', substr($data, $offset, 4))[1];
            $offset += 4;
            $item->tradeGroupId = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->preventedQuantity = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->origQuoteOrderQty = unpack('q', substr($data, $offset, 8))[1];
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

        if ($this->orderListId !== null) {
            $buffer .= pack('q', $this->orderListId);
        }
        if ($this->transactionTime !== null) {
            $buffer .= pack('q', $this->transactionTime);
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

        $this->orderListId = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->transactionTime = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->priceExponent = unpack('c', substr($data, $offset, 1))[1];
        $offset += 1;
        $this->qtyExponent = unpack('c', substr($data, $offset, 1))[1];
        $offset += 1;

        // Skip to end of block for forward compatibility
        $offset = 21;

        $this->orders = $this->decodeOrdersGroup($data, $offset);
        $this->orderReports = $this->decodeOrderReportsGroup($data, $offset);

        $this->listClientOrderId = $this->decodeVarData($data, $offset);
        $this->symbol = $this->decodeVarData($data, $offset);
    }
}
