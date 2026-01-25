<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class BboTbtChannelEvent
{
    public const TEMPLATE_ID = 1000;
    public const SCHEMA_ID = 1;
    public const SCHEMA_VERSION = 0;
    public const BLOCK_LENGTH = 74;

    public int|float|array|null $instIdCode = null;
    public int|float|array|null $tsUs = null;
    public int|float|array|null $outTime = null;
    public int|float|array|null $seqId = null;
    public int|float|array|null $askPxMantissa = null;
    public int|float|array|null $askSzMantissa = null;
    public int|float|array|null $bidPxMantissa = null;
    public int|float|array|null $bidSzMantissa = null;
    public int|float|array|null $askOrdCount = null;
    public int|float|array|null $bidOrdCount = null;
    public int|float|array|null $pxExponent = null;
    public int|float|array|null $szExponent = null;

    public function encode(): string
    {
        $buffer = '';

        if ($this->instIdCode !== null) {
            $buffer .= pack('q', $this->instIdCode);
        }
        if ($this->tsUs !== null) {
            $buffer .= pack('q', $this->tsUs);
        }
        if ($this->outTime !== null) {
            $buffer .= pack('q', $this->outTime);
        }
        if ($this->seqId !== null) {
            $buffer .= pack('q', $this->seqId);
        }
        if ($this->askPxMantissa !== null) {
            $buffer .= pack('q', $this->askPxMantissa);
        }
        if ($this->askSzMantissa !== null) {
            $buffer .= pack('q', $this->askSzMantissa);
        }
        if ($this->bidPxMantissa !== null) {
            $buffer .= pack('q', $this->bidPxMantissa);
        }
        if ($this->bidSzMantissa !== null) {
            $buffer .= pack('q', $this->bidSzMantissa);
        }
        if ($this->askOrdCount !== null) {
            $buffer .= pack('l', $this->askOrdCount);
        }
        if ($this->bidOrdCount !== null) {
            $buffer .= pack('l', $this->bidOrdCount);
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
        $this->outTime = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->seqId = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->askPxMantissa = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->askSzMantissa = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->bidPxMantissa = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->bidSzMantissa = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->askOrdCount = unpack('l', substr($data, $offset, 4))[1];
        $offset += 4;
        $this->bidOrdCount = unpack('l', substr($data, $offset, 4))[1];
        $offset += 4;
        $this->pxExponent = unpack('c', substr($data, $offset, 1))[1];
        $offset += 1;
        $this->szExponent = unpack('c', substr($data, $offset, 1))[1];
        $offset += 1;

        // Skip to end of block for forward compatibility
        $offset = 74;

    }
}
