<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class BalanceUpdateEvent
{
    public const TEMPLATE_ID = 601;
    public const SCHEMA_ID = 3;
    public const SCHEMA_VERSION = 1;
    public const BLOCK_LENGTH = 27;

    public int|float|array|null $eventTime = null;
    public int|float|array|null $clearTime = null;
    public int|float|array|null $qtyExponent = null;
    public int|float|array|null $freeQtyDelta = null;
    public int|float|array|null $subscriptionId = null;
    public string $asset = '';

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
        if ($this->clearTime !== null) {
            $buffer .= pack('q', $this->clearTime);
        }
        if ($this->qtyExponent !== null) {
            $buffer .= pack('c', $this->qtyExponent);
        }
        if ($this->freeQtyDelta !== null) {
            $buffer .= pack('q', $this->freeQtyDelta);
        }
        if ($this->subscriptionId !== null) {
            $buffer .= pack('v', $this->subscriptionId);
        }

        return $buffer;
    }

    public function decode(string $data): void
    {
        $offset = 0;

        $this->eventTime = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->clearTime = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->qtyExponent = unpack('c', substr($data, $offset, 1))[1];
        $offset += 1;
        $this->freeQtyDelta = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->subscriptionId = unpack('v', substr($data, $offset, 2))[1];
        $offset += 2;

        // Skip to end of block for forward compatibility
        $offset = 27;


        $this->asset = $this->decodeVarData($data, $offset);
    }
}
