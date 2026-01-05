<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class ListStatusEvent
{
    public const TEMPLATE_ID = 606;
    public const SCHEMA_ID = 3;
    public const SCHEMA_VERSION = 2;
    public const BLOCK_LENGTH = 29;

    public int|float|array|null $eventTime = null;
    public int|float|array|null $transactTime = null;
    public int|float|array|null $orderListId = null;
    public int|float|array|null $contingencyType = null;
    public int|float|array|null $listStatusType = null;
    public int|float|array|null $listOrderStatus = null;
    public int|float|array|null $subscriptionId = null;
    public array $orders = [];
    public string $symbol = '';
    public string $listClientOrderId = '';
    public string $rejectReason = '';

    public function encode(): string
    {
        $buffer = '';

        if ($this->eventTime !== null) {
            $buffer .= pack('q', $this->eventTime);
        }
        if ($this->transactTime !== null) {
            $buffer .= pack('q', $this->transactTime);
        }
        if ($this->orderListId !== null) {
            $buffer .= pack('q', $this->orderListId);
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
        $this->transactTime = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->orderListId = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->subscriptionId = unpack('v', substr($data, $offset, 2))[1];
        $offset += 2;
    }
}
