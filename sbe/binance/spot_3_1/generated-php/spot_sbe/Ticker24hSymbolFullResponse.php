<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class Ticker24hSymbolFullResponse
{
    public const TEMPLATE_ID = 205;
    public const SCHEMA_ID = 3;
    public const SCHEMA_VERSION = 1;
    public const BLOCK_LENGTH = 182;

    public int|float|array|null $priceExponent = null;
    public int|float|array|null $qtyExponent = null;
    public int|float|array|null $priceChange = null;
    public int|float|array|null $priceChangePercent = null;
    public int|float|array|null $weightedAvgPrice = null;
    public int|float|array|null $prevClosePrice = null;
    public int|float|array|null $lastPrice = null;
    public int|float|array|null $lastQty = null;
    public int|float|array|null $bidPrice = null;
    public int|float|array|null $bidQty = null;
    public int|float|array|null $askPrice = null;
    public int|float|array|null $askQty = null;
    public int|float|array|null $openPrice = null;
    public int|float|array|null $highPrice = null;
    public int|float|array|null $lowPrice = null;
    public int|float|array|null $volume = null;
    public int|float|array|null $quoteVolume = null;
    public int|float|array|null $openTime = null;
    public int|float|array|null $closeTime = null;
    public int|float|array|null $firstId = null;
    public int|float|array|null $lastId = null;
    public int|float|array|null $numTrades = null;
    public string $symbol = '';

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

        if ($this->priceExponent !== null) {
            $buffer .= pack('c', $this->priceExponent);
        }
        if ($this->qtyExponent !== null) {
            $buffer .= pack('c', $this->qtyExponent);
        }
        if ($this->priceChange !== null) {
            $buffer .= pack('q', $this->priceChange);
        }
        if ($this->priceChangePercent !== null) {
            $buffer .= pack('f', $this->priceChangePercent);
        }
        if ($this->weightedAvgPrice !== null) {
            $buffer .= pack('q', $this->weightedAvgPrice);
        }
        if ($this->prevClosePrice !== null) {
            $buffer .= pack('q', $this->prevClosePrice);
        }
        if ($this->lastPrice !== null) {
            $buffer .= pack('q', $this->lastPrice);
        }
        if ($this->lastQty !== null) {
            foreach ($this->lastQty as $val) {
                $buffer .= pack('C', $val);
            }
        }
        if ($this->bidPrice !== null) {
            $buffer .= pack('q', $this->bidPrice);
        }
        if ($this->bidQty !== null) {
            $buffer .= pack('q', $this->bidQty);
        }
        if ($this->askPrice !== null) {
            $buffer .= pack('q', $this->askPrice);
        }
        if ($this->askQty !== null) {
            $buffer .= pack('q', $this->askQty);
        }
        if ($this->openPrice !== null) {
            $buffer .= pack('q', $this->openPrice);
        }
        if ($this->highPrice !== null) {
            $buffer .= pack('q', $this->highPrice);
        }
        if ($this->lowPrice !== null) {
            $buffer .= pack('q', $this->lowPrice);
        }
        if ($this->volume !== null) {
            foreach ($this->volume as $val) {
                $buffer .= pack('C', $val);
            }
        }
        if ($this->quoteVolume !== null) {
            foreach ($this->quoteVolume as $val) {
                $buffer .= pack('C', $val);
            }
        }
        if ($this->openTime !== null) {
            $buffer .= pack('q', $this->openTime);
        }
        if ($this->closeTime !== null) {
            $buffer .= pack('q', $this->closeTime);
        }
        if ($this->firstId !== null) {
            $buffer .= pack('q', $this->firstId);
        }
        if ($this->lastId !== null) {
            $buffer .= pack('q', $this->lastId);
        }
        if ($this->numTrades !== null) {
            $buffer .= pack('q', $this->numTrades);
        }

        return $buffer;
    }

    public function decode(string $data): void
    {
        $offset = 0;

        $this->priceExponent = unpack('c', substr($data, $offset, 1))[1];
        $offset += 1;
        $this->qtyExponent = unpack('c', substr($data, $offset, 1))[1];
        $offset += 1;
        $this->priceChange = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->priceChangePercent = unpack('f', substr($data, $offset, 4))[1];
        $offset += 4;
        $this->weightedAvgPrice = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->prevClosePrice = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->lastPrice = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->lastQty = [];
        for ($i = 0; $i < 16; $i++) {
            $this->lastQty[] = unpack('C', substr($data, $offset, 1))[1];
            $offset += 1;
        }
        $this->bidPrice = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->bidQty = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->askPrice = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->askQty = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->openPrice = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->highPrice = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->lowPrice = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->volume = [];
        for ($i = 0; $i < 16; $i++) {
            $this->volume[] = unpack('C', substr($data, $offset, 1))[1];
            $offset += 1;
        }
        $this->quoteVolume = [];
        for ($i = 0; $i < 16; $i++) {
            $this->quoteVolume[] = unpack('C', substr($data, $offset, 1))[1];
            $offset += 1;
        }
        $this->openTime = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->closeTime = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->firstId = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->lastId = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->numTrades = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;

        // Skip to end of block for forward compatibility
        $offset = 182;


        $this->symbol = $this->decodeVarData($data, $offset);
    }
}
