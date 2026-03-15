<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class Asks
{
    public int|float|null $pxMantissa = null;
    public int|float|null $szMantissa = null;
    public int|float|null $ordCount = null;
}

class Bids
{
    public int|float|null $pxMantissa = null;
    public int|float|null $szMantissa = null;
    public int|float|null $ordCount = null;
}

class BooksL2TbtElpChannelEvent
{
    public const TEMPLATE_ID = 1003;
    public const SCHEMA_ID = 1;
    public const SCHEMA_VERSION = 0;
    public const BLOCK_LENGTH = 42;

    public int|float|array|null $instIdCode = null;
    public int|float|array|null $tsUs = null;
    public int|float|array|null $outTime = null;
    public int|float|array|null $seqId = null;
    public int|float|array|null $prevSeqId = null;
    public int|float|array|null $pxExponent = null;
    public int|float|array|null $szExponent = null;
    public array $asks = [];
    public array $bids = [];

    private function decodeAsksGroup(string $data, int &$offset): array
    {
        $blockLength = unpack('v', substr($data, $offset, 2))[1];
        $offset += 2;
        $numInGroup = unpack('v', substr($data, $offset, 2))[1];
        $offset += 2;

        $items = [];
        for ($i = 0; $i < $numInGroup; $i++) {
            $itemStart = $offset;
            $item = new Asks();

            $item->pxMantissa = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->szMantissa = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->ordCount = unpack('l', substr($data, $offset, 4))[1];
            $offset += 4;

            // Skip to next block for forward compatibility
            $offset = $itemStart + $blockLength;
            $items[] = $item;
        }

        return $items;
    }

    private function decodeBidsGroup(string $data, int &$offset): array
    {
        $blockLength = unpack('v', substr($data, $offset, 2))[1];
        $offset += 2;
        $numInGroup = unpack('v', substr($data, $offset, 2))[1];
        $offset += 2;

        $items = [];
        for ($i = 0; $i < $numInGroup; $i++) {
            $itemStart = $offset;
            $item = new Bids();

            $item->pxMantissa = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->szMantissa = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->ordCount = unpack('l', substr($data, $offset, 4))[1];
            $offset += 4;

            // Skip to next block for forward compatibility
            $offset = $itemStart + $blockLength;
            $items[] = $item;
        }

        return $items;
    }

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
        if ($this->prevSeqId !== null) {
            $buffer .= pack('q', $this->prevSeqId);
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
        $this->prevSeqId = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->pxExponent = unpack('c', substr($data, $offset, 1))[1];
        $offset += 1;
        $this->szExponent = unpack('c', substr($data, $offset, 1))[1];
        $offset += 1;

        // Skip to end of block for forward compatibility
        $offset = 42;

        $this->asks = $this->decodeAsksGroup($data, $offset);
        $this->bids = $this->decodeBidsGroup($data, $offset);
    }
}
