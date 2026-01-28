<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class ExecutionReportEvent
{
    public const TEMPLATE_ID = 603;
    public const SCHEMA_ID = 3;
    public const SCHEMA_VERSION = 2;
    public const BLOCK_LENGTH = 281;

    public int|float|array|null $eventTime = null;
    public int|float|array|null $transactTime = null;
    public int|float|array|null $priceExponent = null;
    public int|float|array|null $qtyExponent = null;
    public int|float|array|null $commissionExponent = null;
    public int|float|array|null $orderCreationTime = null;
    public int|float|array|null $workingTime = null;
    public int|float|array|null $orderId = null;
    public int|float|array|null $orderListId = null;
    public int|float|array|null $origQty = null;
    public int|float|array|null $price = null;
    public int|float|array|null $origQuoteOrderQty = null;
    public int|float|array|null $icebergQty = null;
    public int|float|array|null $stopPrice = null;
    public int|float|array|null $orderType = null;
    public int|float|array|null $side = null;
    public int|float|array|null $timeInForce = null;
    public int|float|array|null $executionType = null;
    public int|float|array|null $orderStatus = null;
    public int|float|array|null $tradeId = null;
    public int|float|array|null $executionId = null;
    public int|float|array|null $executedQty = null;
    public int|float|array|null $cummulativeQuoteQty = null;
    public int|float|array|null $lastQty = null;
    public int|float|array|null $lastPrice = null;
    public int|float|array|null $quoteQty = null;
    public int|float|array|null $commission = null;
    public int|float|array|null $isWorking = null;
    public int|float|array|null $isMaker = null;
    public int|float|array|null $isBestMatch = null;
    public int|float|array|null $matchType = null;
    public int|float|array|null $selfTradePreventionMode = null;
    public int|float|array|null $orderCapacity = null;
    public int|float|array|null $workingFloor = null;
    public int|float|array|null $usedSor = null;
    public int|float|array|null $allocId = null;
    public int|float|array|null $trailingDelta = null;
    public int|float|array|null $trailingTime = null;
    public int|float|array|null $tradeGroupId = null;
    public int|float|array|null $preventedQty = null;
    public int|float|array|null $lastPreventedQty = null;
    public int|float|array|null $preventedMatchId = null;
    public int|float|array|null $preventedExecutionQty = null;
    public int|float|array|null $preventedExecutionPrice = null;
    public int|float|array|null $preventedExecutionQuoteQty = null;
    public int|float|array|null $strategyType = null;
    public int|float|array|null $strategyId = null;
    public int|float|array|null $counterOrderId = null;
    public int|float|array|null $subscriptionId = null;
    public int|float|array|null $pegPriceType = null;
    public int|float|array|null $pegOffsetType = null;
    public int|float|array|null $pegOffsetValue = null;
    public int|float|array|null $peggedPrice = null;
    public string $symbol = '';
    public string $clientOrderId = '';
    public string $origClientOrderId = '';
    public string $commissionAsset = '';
    public string $rejectReason = '';
    public string $counterSymbol = '';

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

        if ($this->eventTime !== null) {
            $buffer .= pack('q', $this->eventTime);
        }
        if ($this->transactTime !== null) {
            $buffer .= pack('q', $this->transactTime);
        }
        if ($this->priceExponent !== null) {
            $buffer .= pack('c', $this->priceExponent);
        }
        if ($this->qtyExponent !== null) {
            $buffer .= pack('c', $this->qtyExponent);
        }
        if ($this->commissionExponent !== null) {
            $buffer .= pack('c', $this->commissionExponent);
        }
        if ($this->orderCreationTime !== null) {
            $buffer .= pack('q', $this->orderCreationTime);
        }
        if ($this->workingTime !== null) {
            $buffer .= pack('q', $this->workingTime);
        }
        if ($this->orderId !== null) {
            $buffer .= pack('q', $this->orderId);
        }
        if ($this->orderListId !== null) {
            $buffer .= pack('q', $this->orderListId);
        }
        if ($this->origQty !== null) {
            $buffer .= pack('q', $this->origQty);
        }
        if ($this->price !== null) {
            $buffer .= pack('q', $this->price);
        }
        if ($this->origQuoteOrderQty !== null) {
            $buffer .= pack('q', $this->origQuoteOrderQty);
        }
        if ($this->icebergQty !== null) {
            $buffer .= pack('q', $this->icebergQty);
        }
        if ($this->stopPrice !== null) {
            $buffer .= pack('q', $this->stopPrice);
        }
        if ($this->tradeId !== null) {
            $buffer .= pack('q', $this->tradeId);
        }
        if ($this->executionId !== null) {
            $buffer .= pack('q', $this->executionId);
        }
        if ($this->executedQty !== null) {
            $buffer .= pack('q', $this->executedQty);
        }
        if ($this->cummulativeQuoteQty !== null) {
            $buffer .= pack('q', $this->cummulativeQuoteQty);
        }
        if ($this->lastQty !== null) {
            $buffer .= pack('q', $this->lastQty);
        }
        if ($this->lastPrice !== null) {
            $buffer .= pack('q', $this->lastPrice);
        }
        if ($this->quoteQty !== null) {
            $buffer .= pack('q', $this->quoteQty);
        }
        if ($this->commission !== null) {
            $buffer .= pack('q', $this->commission);
        }
        if ($this->allocId !== null) {
            $buffer .= pack('q', $this->allocId);
        }
        if ($this->trailingDelta !== null) {
            $buffer .= pack('P', $this->trailingDelta);
        }
        if ($this->trailingTime !== null) {
            $buffer .= pack('q', $this->trailingTime);
        }
        if ($this->tradeGroupId !== null) {
            $buffer .= pack('q', $this->tradeGroupId);
        }
        if ($this->preventedQty !== null) {
            $buffer .= pack('q', $this->preventedQty);
        }
        if ($this->lastPreventedQty !== null) {
            $buffer .= pack('q', $this->lastPreventedQty);
        }
        if ($this->preventedMatchId !== null) {
            $buffer .= pack('q', $this->preventedMatchId);
        }
        if ($this->preventedExecutionQty !== null) {
            $buffer .= pack('q', $this->preventedExecutionQty);
        }
        if ($this->preventedExecutionPrice !== null) {
            $buffer .= pack('q', $this->preventedExecutionPrice);
        }
        if ($this->preventedExecutionQuoteQty !== null) {
            $buffer .= pack('q', $this->preventedExecutionQuoteQty);
        }
        if ($this->strategyType !== null) {
            $buffer .= pack('l', $this->strategyType);
        }
        if ($this->strategyId !== null) {
            $buffer .= pack('q', $this->strategyId);
        }
        if ($this->counterOrderId !== null) {
            $buffer .= pack('q', $this->counterOrderId);
        }
        if ($this->subscriptionId !== null) {
            $buffer .= pack('v', $this->subscriptionId);
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

        $this->eventTime = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->transactTime = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->priceExponent = unpack('c', substr($data, $offset, 1))[1];
        $offset += 1;
        $this->qtyExponent = unpack('c', substr($data, $offset, 1))[1];
        $offset += 1;
        $this->commissionExponent = unpack('c', substr($data, $offset, 1))[1];
        $offset += 1;
        $this->orderCreationTime = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->workingTime = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->orderId = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->orderListId = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->origQty = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->price = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->origQuoteOrderQty = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->icebergQty = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->stopPrice = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->tradeId = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->executionId = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->executedQty = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->cummulativeQuoteQty = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->lastQty = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->lastPrice = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->quoteQty = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->commission = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->allocId = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->trailingDelta = unpack('P', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->trailingTime = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->tradeGroupId = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->preventedQty = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->lastPreventedQty = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->preventedMatchId = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->preventedExecutionQty = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->preventedExecutionPrice = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->preventedExecutionQuoteQty = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->strategyType = unpack('l', substr($data, $offset, 4))[1];
        $offset += 4;
        $this->strategyId = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->counterOrderId = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->subscriptionId = unpack('v', substr($data, $offset, 2))[1];
        $offset += 2;
        $this->pegOffsetValue = unpack('C', substr($data, $offset, 1))[1];
        $offset += 1;
        $this->peggedPrice = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;

        // Skip to end of block for forward compatibility
        $offset = 281;


        $this->symbol = $this->decodeVarData($data, $offset);
        $this->clientOrderId = $this->decodeVarData($data, $offset);
        $this->origClientOrderId = $this->decodeVarData($data, $offset);
        $this->commissionAsset = $this->decodeVarData($data, $offset);
        $this->rejectReason = $this->decodeVarData($data, $offset);
        $this->counterSymbol = $this->decodeVarData($data, $offset);
    }
}
