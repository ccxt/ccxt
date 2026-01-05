<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class OrderAmendmentsResponse
{
    public const TEMPLATE_ID = 316;
    public const SCHEMA_ID = 3;
    public const SCHEMA_VERSION = 2;
    public const BLOCK_LENGTH = 0;

    public array $amendments = [];

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
