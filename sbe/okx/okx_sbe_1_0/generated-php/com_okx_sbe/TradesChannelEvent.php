<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class TradesChannelEvent
{
    public const TEMPLATE_ID = 1005;
    public const SCHEMA_ID = 1;
    public const SCHEMA_VERSION = 0;
    public const BLOCK_LENGTH = 62;

    public int|float|array|null $instIdCode = null;
    public int|float|array|null $tsUs = null;
    public int|float|array|null $outTime = null;
    public int|float|array|null $seqId = null;
    public int|float|array|null $pxMantissa = null;
    public int|float|array|null $szMantissa = null;
    public int|float|array|null $tradeId = null;
    public int|float|array|null $count = null;
    public int|float|array|null $side = null;
    public int|float|array|null $pxExponent = null;
    public int|float|array|null $szExponent = null;
    public int|float|array|null $source = null;

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
        if ($this->pxMantissa !== null) {
            $buffer .= pack('q', $this->pxMantissa);
        }
        if ($this->szMantissa !== null) {
            $buffer .= pack('q', $this->szMantissa);
        }
        if ($this->tradeId !== null) {
            $buffer .= pack('q', $this->tradeId);
        }
        if ($this->count !== null) {
            $buffer .= pack('s', $this->count);
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
        $this->pxMantissa = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->szMantissa = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->tradeId = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->count = unpack('s', substr($data, $offset, 2))[1];
        $offset += 2;
        $this->pxExponent = unpack('c', substr($data, $offset, 1))[1];
        $offset += 1;
        $this->szExponent = unpack('c', substr($data, $offset, 1))[1];
        $offset += 1;
    }
}
