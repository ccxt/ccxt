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
}

class NewOrderListAckResponse
{
    public const TEMPLATE_ID = 309;
    public const SCHEMA_ID = 3;
    public const SCHEMA_VERSION = 1;
    public const BLOCK_LENGTH = 19;

    public int|float|array|null $orderListId = null;
    public int|float|array|null $contingencyType = null;
    public int|float|array|null $listStatusType = null;
    public int|float|array|null $listOrderStatus = null;
    public int|float|array|null $transactionTime = null;
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

        return $buffer;
    }

    public function decode(string $data): void
    {
        $offset = 0;

        $this->orderListId = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->transactionTime = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;

        // Skip to end of block for forward compatibility
        $offset = 19;

        $this->orders = $this->decodeOrdersGroup($data, $offset);
        $this->orderReports = $this->decodeOrderReportsGroup($data, $offset);

        $this->listClientOrderId = $this->decodeVarData($data, $offset);
        $this->symbol = $this->decodeVarData($data, $offset);
    }
}
