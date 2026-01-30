<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class UserDataStreamUnsubscribeResponse
{
    public const TEMPLATE_ID = 504;
    public const SCHEMA_ID = 3;
    public const SCHEMA_VERSION = 2;
    public const BLOCK_LENGTH = 0;


    public function encode(): string
    {
        $buffer = '';


        return $buffer;
    }

    public function decode(string $data): void
    {
        $offset = 0;


        // Skip to end of block for forward compatibility
        $offset = 0;

    }
}
