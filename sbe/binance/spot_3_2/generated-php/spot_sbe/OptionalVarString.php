<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class OptionalVarString
{
    public int|float $length = 0;
    public int|float $varData = 0;

    public function encode(): string
    {
        $buffer = '';

        $buffer .= pack('v', $this->length);
        $buffer .= pack('C', $this->varData);

        return $buffer;
    }

    public function decode(string $data, int &$offset = 0): void
    {
        $this->length = unpack('v', substr($data, $offset, 2))[1];
        $offset += 2;
        $this->varData = unpack('C', substr($data, $offset, 1))[1];
        $offset += 1;
    }

    public static function encodedLength(): int
    {
        return -1;
    }
}
