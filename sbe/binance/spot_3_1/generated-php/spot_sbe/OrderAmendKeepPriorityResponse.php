<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class ListStatus
{
    public int|float|null $orderListId = null;
    public int|float|null $orderId = null;
}

class RelatedOrders
{
    public int|float|null $orderId = null;
    public int|float|null $orderListId = null;
    public int|float|null $price = null;
    public int|float|null $qty = null;
    public int|float|null $executedQty = null;
    public int|float|null $preventedQty = null;
    public int|float|null $cumulativeQuoteQty = null;
    public int|float|null $stopPrice = null;
    public int|float|null $trailingDelta = null;
    public int|float|null $trailingTime = null;
    public int|float|null $icebergQty = null;
    public int|float|null $workingTime = null;
    public int|float|null $strategyId = null;
    public int|float|null $strategyType = null;
    public int|float|null $pegOffsetValue = null;
    public int|float|null $peggedPrice = null;
}

class OrderAmendKeepPriorityResponse
{
    public const TEMPLATE_ID = 317;
    public const SCHEMA_ID = 3;
    public const SCHEMA_VERSION = 1;
    public const BLOCK_LENGTH = 145;

    public int|float|array|null $transactTime = null;
    public int|float|array|null $executionId = null;
    public int|float|array|null $priceExponent = null;
    public int|float|array|null $qtyExponent = null;
    public int|float|array|null $orderId = null;
    public int|float|array|null $orderListId = null;
    public int|float|array|null $price = null;
    public int|float|array|null $qty = null;
    public int|float|array|null $executedQty = null;
    public int|float|array|null $preventedQty = null;
    public int|float|array|null $cumulativeQuoteQty = null;
    public int|float|array|null $status = null;
    public int|float|array|null $timeInForce = null;
    public int|float|array|null $orderType = null;
    public int|float|array|null $side = null;
    public int|float|array|null $stopPrice = null;
    public int|float|array|null $trailingDelta = null;
    public int|float|array|null $trailingTime = null;
    public int|float|array|null $icebergQty = null;
    public int|float|array|null $workingTime = null;
    public int|float|array|null $strategyId = null;
    public int|float|array|null $strategyType = null;
    public int|float|array|null $orderCapacity = null;
    public int|float|array|null $workingFloor = null;
    public int|float|array|null $selfTradePreventionMode = null;
    public int|float|array|null $usedSor = null;
    public int|float|array|null $pegPriceType = null;
    public int|float|array|null $pegOffsetType = null;
    public int|float|array|null $pegOffsetValue = null;
    public int|float|array|null $peggedPrice = null;
    public array $listStatus = [];
    public array $relatedOrders = [];
    public string $symbol = '';
    public string $origClientOrderId = '';
    public string $clientOrderId = '';

    private function decodeListStatusGroup(string $data, int &$offset): array
    {
        $blockLength = unpack('v', substr($data, $offset, 2))[1];
        $offset += 2;
        $numInGroup = unpack('v', substr($data, $offset, 2))[1];
        $offset += 2;

        $items = [];
        for ($i = 0; $i < $numInGroup; $i++) {
            $itemStart = $offset;
            $item = new ListStatus();

            $item->orderListId = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->orderId = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;

            // Skip to next block for forward compatibility
            $offset = $itemStart + $blockLength;
            $items[] = $item;
        }

        return $items;
    }

    private function decodeRelatedOrdersGroup(string $data, int &$offset): array
    {
        $blockLength = unpack('v', substr($data, $offset, 2))[1];
        $offset += 2;
        $numInGroup = unpack('v', substr($data, $offset, 2))[1];
        $offset += 2;

        $items = [];
        for ($i = 0; $i < $numInGroup; $i++) {
            $itemStart = $offset;
            $item = new RelatedOrders();

            $item->orderId = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->orderListId = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->price = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->qty = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->executedQty = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->preventedQty = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->cumulativeQuoteQty = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->stopPrice = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->trailingDelta = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->trailingTime = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->icebergQty = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->workingTime = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->strategyId = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->strategyType = unpack('l', substr($data, $offset, 4))[1];
            $offset += 4;
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

        if ($this->transactTime !== null) {
            $buffer .= pack('q', $this->transactTime);
        }
        if ($this->executionId !== null) {
            $buffer .= pack('q', $this->executionId);
        }
        if ($this->priceExponent !== null) {
            $buffer .= pack('c', $this->priceExponent);
        }
        if ($this->qtyExponent !== null) {
            $buffer .= pack('c', $this->qtyExponent);
        }
        if ($this->orderId !== null) {
            $buffer .= pack('q', $this->orderId);
        }
        if ($this->orderListId !== null) {
            $buffer .= pack('q', $this->orderListId);
        }
        if ($this->price !== null) {
            $buffer .= pack('q', $this->price);
        }
        if ($this->qty !== null) {
            $buffer .= pack('q', $this->qty);
        }
        if ($this->executedQty !== null) {
            $buffer .= pack('q', $this->executedQty);
        }
        if ($this->preventedQty !== null) {
            $buffer .= pack('q', $this->preventedQty);
        }
        if ($this->cumulativeQuoteQty !== null) {
            $buffer .= pack('q', $this->cumulativeQuoteQty);
        }
        if ($this->stopPrice !== null) {
            $buffer .= pack('q', $this->stopPrice);
        }
        if ($this->trailingDelta !== null) {
            $buffer .= pack('q', $this->trailingDelta);
        }
        if ($this->trailingTime !== null) {
            $buffer .= pack('q', $this->trailingTime);
        }
        if ($this->icebergQty !== null) {
            $buffer .= pack('q', $this->icebergQty);
        }
        if ($this->workingTime !== null) {
            $buffer .= pack('q', $this->workingTime);
        }
        if ($this->strategyId !== null) {
            $buffer .= pack('q', $this->strategyId);
        }
        if ($this->strategyType !== null) {
            $buffer .= pack('l', $this->strategyType);
        }
        if ($this->pegOffsetValue !== null) {
            $buffer .= pack('C', $this->pegOffsetValue);
        }
        if ($this->peggedPrice !== null) {
            $buffer .= pack('q', $this->peggedPrice);
        }

        return $buffer;
    }

    public function decode(string $data): void
    {
        $offset = 0;

        $this->transactTime = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->executionId = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->priceExponent = unpack('c', substr($data, $offset, 1))[1];
        $offset += 1;
        $this->qtyExponent = unpack('c', substr($data, $offset, 1))[1];
        $offset += 1;
        $this->orderId = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->orderListId = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->price = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->qty = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->executedQty = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->preventedQty = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->cumulativeQuoteQty = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->stopPrice = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->trailingDelta = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->trailingTime = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->icebergQty = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->workingTime = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->strategyId = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->strategyType = unpack('l', substr($data, $offset, 4))[1];
        $offset += 4;
        $this->pegOffsetValue = unpack('C', substr($data, $offset, 1))[1];
        $offset += 1;
        $this->peggedPrice = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;

        // Skip to end of block for forward compatibility
        $offset = 145;

        $this->listStatus = $this->decodeListStatusGroup($data, $offset);
        $this->relatedOrders = $this->decodeRelatedOrdersGroup($data, $offset);

        $this->symbol = $this->decodeVarData($data, $offset);
        $this->origClientOrderId = $this->decodeVarData($data, $offset);
        $this->clientOrderId = $this->decodeVarData($data, $offset);
    }
}
