<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class Fills
{
    public int|float|null $commissionExponent = null;
    public int|float|null $price = null;
    public int|float|null $qty = null;
    public int|float|null $commission = null;
    public int|float|null $tradeId = null;
    public int|float|null $allocId = null;
}

class PreventedMatches
{
    public int|float|null $preventedMatchId = null;
    public int|float|null $makerOrderId = null;
    public int|float|null $price = null;
    public int|float|null $takerPreventedQuantity = null;
    public int|float|null $makerPreventedQuantity = null;
}

class NewOrderFullResponse
{
    public const TEMPLATE_ID = 302;
    public const SCHEMA_ID = 3;
    public const SCHEMA_VERSION = 1;
    public const BLOCK_LENGTH = 153;

    public int|float|array|null $priceExponent = null;
    public int|float|array|null $qtyExponent = null;
    public int|float|array|null $orderId = null;
    public int|float|array|null $orderListId = null;
    public int|float|array|null $transactTime = null;
    public int|float|array|null $price = null;
    public int|float|array|null $origQty = null;
    public int|float|array|null $executedQty = null;
    public int|float|array|null $cummulativeQuoteQty = null;
    public int|float|array|null $status = null;
    public int|float|array|null $timeInForce = null;
    public int|float|array|null $orderType = null;
    public int|float|array|null $side = null;
    public int|float|array|null $stopPrice = null;
    public int|float|array|null $trailingDelta = null;
    public int|float|array|null $trailingTime = null;
    public int|float|array|null $workingTime = null;
    public int|float|array|null $icebergQty = null;
    public int|float|array|null $strategyId = null;
    public int|float|array|null $strategyType = null;
    public int|float|array|null $orderCapacity = null;
    public int|float|array|null $workingFloor = null;
    public int|float|array|null $selfTradePreventionMode = null;
    public int|float|array|null $tradeGroupId = null;
    public int|float|array|null $preventedQuantity = null;
    public int|float|array|null $usedSor = null;
    public int|float|array|null $origQuoteOrderQty = null;
    public int|float|array|null $pegPriceType = null;
    public int|float|array|null $pegOffsetType = null;
    public int|float|array|null $pegOffsetValue = null;
    public int|float|array|null $peggedPrice = null;
    public array $fills = [];
    public array $preventedMatches = [];
    public string $symbol = '';
    public string $clientOrderId = '';

    private function decodeFillsGroup(string $data, int &$offset): array
    {
        $blockLength = unpack('v', substr($data, $offset, 2))[1];
        $offset += 2;
        $numInGroup = unpack('V', substr($data, $offset, 4))[1];
        $offset += 4;

        $items = [];
        for ($i = 0; $i < $numInGroup; $i++) {
            $itemStart = $offset;
            $item = new Fills();

            $item->commissionExponent = unpack('c', substr($data, $offset, 1))[1];
            $offset += 1;
            $item->price = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->qty = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->commission = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->tradeId = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->allocId = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;

            // Skip to next block for forward compatibility
            $offset = $itemStart + $blockLength;
            $items[] = $item;
        }

        return $items;
    }

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

            $item->preventedMatchId = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->makerOrderId = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->price = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->takerPreventedQuantity = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->makerPreventedQuantity = unpack('q', substr($data, $offset, 8))[1];
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
        if ($this->transactTime !== null) {
            $buffer .= pack('q', $this->transactTime);
        }
        if ($this->price !== null) {
            $buffer .= pack('q', $this->price);
        }
        if ($this->origQty !== null) {
            $buffer .= pack('q', $this->origQty);
        }
        if ($this->executedQty !== null) {
            $buffer .= pack('q', $this->executedQty);
        }
        if ($this->cummulativeQuoteQty !== null) {
            $buffer .= pack('q', $this->cummulativeQuoteQty);
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
        if ($this->workingTime !== null) {
            $buffer .= pack('q', $this->workingTime);
        }
        if ($this->icebergQty !== null) {
            $buffer .= pack('q', $this->icebergQty);
        }
        if ($this->strategyId !== null) {
            $buffer .= pack('q', $this->strategyId);
        }
        if ($this->strategyType !== null) {
            $buffer .= pack('l', $this->strategyType);
        }
        if ($this->tradeGroupId !== null) {
            $buffer .= pack('q', $this->tradeGroupId);
        }
        if ($this->preventedQuantity !== null) {
            $buffer .= pack('q', $this->preventedQuantity);
        }
        if ($this->origQuoteOrderQty !== null) {
            $buffer .= pack('q', $this->origQuoteOrderQty);
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

        $this->priceExponent = unpack('c', substr($data, $offset, 1))[1];
        $offset += 1;
        $this->qtyExponent = unpack('c', substr($data, $offset, 1))[1];
        $offset += 1;
        $this->orderId = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->orderListId = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->transactTime = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->price = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->origQty = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->executedQty = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->cummulativeQuoteQty = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->stopPrice = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->trailingDelta = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->trailingTime = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->workingTime = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->icebergQty = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->strategyId = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->strategyType = unpack('l', substr($data, $offset, 4))[1];
        $offset += 4;
        $this->tradeGroupId = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->preventedQuantity = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->origQuoteOrderQty = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->pegOffsetValue = unpack('C', substr($data, $offset, 1))[1];
        $offset += 1;
        $this->peggedPrice = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;

        // Skip to end of block for forward compatibility
        $offset = 153;

        $this->fills = $this->decodeFillsGroup($data, $offset);
        $this->preventedMatches = $this->decodePreventedMatchesGroup($data, $offset);

        $this->symbol = $this->decodeVarData($data, $offset);
        $this->clientOrderId = $this->decodeVarData($data, $offset);
    }
}
