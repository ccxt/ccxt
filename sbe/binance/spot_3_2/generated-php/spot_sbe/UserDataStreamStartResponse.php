<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class UserDataStreamStartResponse
{
    public const TEMPLATE_ID = 500;
    public const SCHEMA_ID = 3;
    public const SCHEMA_VERSION = 2;
    public const BLOCK_LENGTH = 0;

    public string $listenKey = '';

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
        $offset = 0;


        $this->listenKey = $this->decodeVarData($data, $offset);
    }
}
