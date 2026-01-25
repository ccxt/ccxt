<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class MessageHeader
{
    public int|float $blockLength = 0;
    public int|float $templateId = 0;
    public int|float $schemaId = 0;
    public int|float $version = 0;

    public function encode(): string
    {
        $buffer = '';

        $buffer .= pack('v', $this->blockLength);
        $buffer .= pack('v', $this->templateId);
        $buffer .= pack('v', $this->schemaId);
        $buffer .= pack('v', $this->version);

        return $buffer;
    }

    public function decode(string $data, int &$offset = 0): void
    {
        $this->blockLength = unpack('v', substr($data, $offset, 2))[1];
        $offset += 2;
        $this->templateId = unpack('v', substr($data, $offset, 2))[1];
        $offset += 2;
        $this->schemaId = unpack('v', substr($data, $offset, 2))[1];
        $offset += 2;
        $this->version = unpack('v', substr($data, $offset, 2))[1];
        $offset += 2;
    }

    public static function encodedLength(): int
    {
        return 8;
    }
}
