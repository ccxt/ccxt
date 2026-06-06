<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class NewOrderAckResponse
{
    public const TEMPLATE_ID = 300;
    public const SCHEMA_ID = 3;
    public const SCHEMA_VERSION = 2;
    public const BLOCK_LENGTH = 24;

    public int|float|array|null $orderId = null;
    public int|float|array|null $orderListId = null;
    public int|float|array|null $transactTime = null;
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

        if ($this->orderId !== null) {
            $buffer .= pack('q', $this->orderId);
        }
        if ($this->orderListId !== null) {
            $buffer .= pack('q', $this->orderListId);
        }
        if ($this->transactTime !== null) {
            $buffer .= pack('q', $this->transactTime);
        }

        return $buffer;
    }

    public function decode(string $data): void
    {
        $offset = 0;

        $this->orderId = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->orderListId = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->transactTime = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;

        // Skip to end of block for forward compatibility
        $offset = 24;


        $this->symbol = $this->decodeVarData($data, $offset);
        $this->clientOrderId = $this->decodeVarData($data, $offset);
    }
}
