<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class SnapshotDepthResponseEvent
{
    public const TEMPLATE_ID = 1006;
    public const SCHEMA_ID = 1;
    public const SCHEMA_VERSION = 0;
    public const BLOCK_LENGTH = 26;

    public int|float|array|null $instIdCode = null;
    public int|float|array|null $tsUs = null;
    public int|float|array|null $seqId = null;
    public int|float|array|null $pxExponent = null;
    public int|float|array|null $szExponent = null;
    public array $asks = [];
    public array $bids = [];

    public function encode(): string
    {
        $buffer = '';

        if ($this->instIdCode !== null) {
            $buffer .= pack('q', $this->instIdCode);
        }
        if ($this->tsUs !== null) {
            $buffer .= pack('q', $this->tsUs);
        }
        if ($this->seqId !== null) {
            $buffer .= pack('q', $this->seqId);
        }
        if ($this->pxExponent !== null) {
            $buffer .= pack('c', $this->pxExponent);
        }
        if ($this->szExponent !== null) {
            $buffer .= pack('c', $this->szExponent);
        }

        return $buffer;
    }

    public function decode(string $data): void
    {
        $offset = 0;

        $this->instIdCode = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->tsUs = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->seqId = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->pxExponent = unpack('c', substr($data, $offset, 1))[1];
        $offset += 1;
        $this->szExponent = unpack('c', substr($data, $offset, 1))[1];
        $offset += 1;
    }
}
