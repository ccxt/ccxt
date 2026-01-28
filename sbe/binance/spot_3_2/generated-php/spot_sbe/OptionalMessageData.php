<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class OptionalMessageData
{
    public int|float $length = 0;
    public int|float $varData = 0;

    public function encode(): string
    {
        $buffer = '';

        $buffer .= pack('V', $this->length);
        $buffer .= pack('C', $this->varData);

        return $buffer;
    }

    public function decode(string $data, int &$offset = 0): void
    {
        $this->length = unpack('V', substr($data, $offset, 4))[1];
        $offset += 4;
        $this->varData = unpack('C', substr($data, $offset, 1))[1];
        $offset += 1;
    }

    public static function encodedLength(): int
    {
        return -1;
    }
}
