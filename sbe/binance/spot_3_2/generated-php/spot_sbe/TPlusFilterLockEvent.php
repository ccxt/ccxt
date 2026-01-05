<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class TPlusFilterLockEvent
{
    public const TEMPLATE_ID = 608;
    public const SCHEMA_ID = 3;
    public const SCHEMA_VERSION = 2;
    public const BLOCK_LENGTH = 11;

    public int|float|array|null $eventTime = null;
    public int|float|array|null $qtyExponent = null;
    public int|float|array|null $subscriptionId = null;
    public array $unlockData = [];
    public string $symbol = '';
    public string $baseAsset = '';

    public function encode(): string
    {
        $buffer = '';

        if ($this->eventTime !== null) {
            $buffer .= pack('q', $this->eventTime);
        }
        if ($this->qtyExponent !== null) {
            $buffer .= pack('c', $this->qtyExponent);
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
        $this->qtyExponent = unpack('c', substr($data, $offset, 1))[1];
        $offset += 1;
        $this->subscriptionId = unpack('v', substr($data, $offset, 2))[1];
        $offset += 2;
    }
}
