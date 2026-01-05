<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class OrderListResponse
{
    public const TEMPLATE_ID = 313;
    public const SCHEMA_ID = 3;
    public const SCHEMA_VERSION = 2;
    public const BLOCK_LENGTH = 19;

    public int|float|array|null $orderListId = null;
    public int|float|array|null $contingencyType = null;
    public int|float|array|null $listStatusType = null;
    public int|float|array|null $listOrderStatus = null;
    public int|float|array|null $transactionTime = null;
    public array $orders = [];
    public string $listClientOrderId = '';
    public string $symbol = '';

    public function encode(): string
    {
        $buffer = '';

        if ($this->orderListId !== null) {
            $buffer .= pack('q', $this->orderListId);
        }
        if ($this->transactionTime !== null) {
            $buffer .= pack('q', $this->transactionTime);
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
    }
}
