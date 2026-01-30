<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class CancelReplaceOrderResponse
{
    public const TEMPLATE_ID = 307;
    public const SCHEMA_ID = 3;
    public const SCHEMA_VERSION = 1;
    public const BLOCK_LENGTH = 2;

    public int|float|array|null $cancelResult = null;
    public int|float|array|null $newOrderResult = null;
    public string $cancelResponse = '';
    public string $newOrderResponse = '';

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


        return $buffer;
    }

    public function decode(string $data): void
    {
        $offset = 0;


        // Skip to end of block for forward compatibility
        $offset = 2;


        $this->cancelResponse = $this->decodeVarData($data, $offset);
        $this->newOrderResponse = $this->decodeVarData($data, $offset);
    }
}
