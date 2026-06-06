<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class GroupSizeEncoding
{
    public int|float $blockLength = 0;
    public int|float $numInGroup = 0;

    public function encode(): string
    {
        $buffer = '';

        $buffer .= pack('v', $this->blockLength);
        $buffer .= pack('V', $this->numInGroup);

        return $buffer;
    }

    public function decode(string $data, int &$offset = 0): void
    {
        $this->blockLength = unpack('v', substr($data, $offset, 2))[1];
        $offset += 2;
        $this->numInGroup = unpack('V', substr($data, $offset, 4))[1];
        $offset += 4;
    }

    public static function encodedLength(): int
    {
        return 6;
    }
}
