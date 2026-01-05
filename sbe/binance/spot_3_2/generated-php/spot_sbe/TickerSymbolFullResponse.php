<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class TickerSymbolFullResponse
{
    public const TEMPLATE_ID = 213;
    public const SCHEMA_ID = 3;
    public const SCHEMA_VERSION = 2;
    public const BLOCK_LENGTH = 126;

    public int|float|array|null $priceExponent = null;
    public int|float|array|null $qtyExponent = null;
    public int|float|array|null $priceChange = null;
    public int|float|array|null $priceChangePercent = null;
    public int|float|array|null $weightedAvgPrice = null;
    public int|float|array|null $openPrice = null;
    public int|float|array|null $highPrice = null;
    public int|float|array|null $lowPrice = null;
    public int|float|array|null $lastPrice = null;
    public int|float|array|null $volume = null;
    public int|float|array|null $quoteVolume = null;
    public int|float|array|null $openTime = null;
    public int|float|array|null $closeTime = null;
    public int|float|array|null $firstId = null;
    public int|float|array|null $lastId = null;
    public int|float|array|null $numTrades = null;
    public string $symbol = '';

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
        if ($this->openPrice !== null) {
            $buffer .= pack('q', $this->openPrice);
        }
        if ($this->highPrice !== null) {
            $buffer .= pack('q', $this->highPrice);
        }
        if ($this->lowPrice !== null) {
            $buffer .= pack('q', $this->lowPrice);
        }
        if ($this->lastPrice !== null) {
            $buffer .= pack('q', $this->lastPrice);
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
        $this->openPrice = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->highPrice = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->lowPrice = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->lastPrice = unpack('q', substr($data, $offset, 8))[1];
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
    }
}
