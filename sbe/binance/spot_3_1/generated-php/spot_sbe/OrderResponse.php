<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class OrderResponse
{
    public const TEMPLATE_ID = 304;
    public const SCHEMA_ID = 3;
    public const SCHEMA_VERSION = 1;
    public const BLOCK_LENGTH = 162;

    public int|float|array|null $priceExponent = null;
    public int|float|array|null $qtyExponent = null;
    public int|float|array|null $orderId = null;
    public int|float|array|null $orderListId = null;
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
    public int|float|array|null $icebergQty = null;
    public int|float|array|null $time = null;
    public int|float|array|null $updateTime = null;
    public int|float|array|null $isWorking = null;
    public int|float|array|null $workingTime = null;
    public int|float|array|null $origQuoteOrderQty = null;
    public int|float|array|null $strategyId = null;
    public int|float|array|null $strategyType = null;
    public int|float|array|null $orderCapacity = null;
    public int|float|array|null $workingFloor = null;
    public int|float|array|null $selfTradePreventionMode = null;
    public int|float|array|null $preventedMatchId = null;
    public int|float|array|null $preventedQuantity = null;
    public int|float|array|null $usedSor = null;
    public int|float|array|null $pegPriceType = null;
    public int|float|array|null $pegOffsetType = null;
    public int|float|array|null $pegOffsetValue = null;
    public int|float|array|null $peggedPrice = null;
    public string $symbol = '';
    public string $clientOrderId = '';

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
        if ($this->icebergQty !== null) {
            $buffer .= pack('q', $this->icebergQty);
        }
        if ($this->time !== null) {
            $buffer .= pack('q', $this->time);
        }
        if ($this->updateTime !== null) {
            $buffer .= pack('q', $this->updateTime);
        }
        if ($this->workingTime !== null) {
            $buffer .= pack('q', $this->workingTime);
        }
        if ($this->origQuoteOrderQty !== null) {
            $buffer .= pack('q', $this->origQuoteOrderQty);
        }
        if ($this->strategyId !== null) {
            $buffer .= pack('q', $this->strategyId);
        }
        if ($this->strategyType !== null) {
            $buffer .= pack('l', $this->strategyType);
        }
        if ($this->preventedMatchId !== null) {
            $buffer .= pack('q', $this->preventedMatchId);
        }
        if ($this->preventedQuantity !== null) {
            $buffer .= pack('q', $this->preventedQuantity);
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
        $this->icebergQty = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->time = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->updateTime = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->workingTime = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->origQuoteOrderQty = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->strategyId = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->strategyType = unpack('l', substr($data, $offset, 4))[1];
        $offset += 4;
        $this->preventedMatchId = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->preventedQuantity = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->pegOffsetValue = unpack('C', substr($data, $offset, 1))[1];
        $offset += 1;
        $this->peggedPrice = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;

        // Skip to end of block for forward compatibility
        $offset = 162;


        $this->symbol = $this->decodeVarData($data, $offset);
        $this->clientOrderId = $this->decodeVarData($data, $offset);
    }
}
