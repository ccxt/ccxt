<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class CancelReplaceOrderResponse
{
    public const TEMPLATE_ID = 307;
    public const SCHEMA_ID = 3;
    public const SCHEMA_VERSION = 2;
    public const BLOCK_LENGTH = 2;

    public int|float|array|null $cancelResult = null;
    public int|float|array|null $newOrderResult = null;
    public string $cancelResponse = '';
    public string $newOrderResponse = '';

    public function encode(): string
    {
        $buffer = '';


        return $buffer;
    }

    public function decode(string $data): void
    {
        $offset = 0;

    }
}
