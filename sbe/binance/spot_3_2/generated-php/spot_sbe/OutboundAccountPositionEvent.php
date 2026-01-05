<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class OutboundAccountPositionEvent
{
    public const TEMPLATE_ID = 607;
    public const SCHEMA_ID = 3;
    public const SCHEMA_VERSION = 2;
    public const BLOCK_LENGTH = 18;

    public int|float|array|null $eventTime = null;
    public int|float|array|null $updateTime = null;
    public int|float|array|null $subscriptionId = null;
    public array $balances = [];

    public function encode(): string
    {
        $buffer = '';

        if ($this->eventTime !== null) {
            $buffer .= pack('q', $this->eventTime);
        }
        if ($this->updateTime !== null) {
            $buffer .= pack('q', $this->updateTime);
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
        $this->updateTime = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->subscriptionId = unpack('v', substr($data, $offset, 2))[1];
        $offset += 2;
    }
}
