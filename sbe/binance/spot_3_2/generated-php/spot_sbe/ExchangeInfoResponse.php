<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class ExchangeInfoResponse
{
    public const TEMPLATE_ID = 103;
    public const SCHEMA_ID = 3;
    public const SCHEMA_VERSION = 2;
    public const BLOCK_LENGTH = 0;

    public array $rateLimits = [];
    public array $exchangeFilters = [];
    public array $symbols = [];
    public array $sors = [];

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
