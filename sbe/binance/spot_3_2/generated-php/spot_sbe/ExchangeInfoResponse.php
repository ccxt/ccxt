<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class RateLimits
{
    public int|float|null $intervalNum = null;
    public int|float|null $rateLimit = null;
}

class ExchangeFilters
{
}

class Symbols
{
    public int|float|null $baseAssetPrecision = null;
    public int|float|null $quoteAssetPrecision = null;
    public int|float|null $baseCommissionPrecision = null;
    public int|float|null $quoteCommissionPrecision = null;
}

class Sors
{
}

class ExchangeInfoResponse
{
    public const TEMPLATE_ID = 103;
    public const SCHEMA_ID = 3;
    public const SCHEMA_VERSION = 2;
    public const BLOCK_LENGTH = 0;

    public array $rateLimits = [];
    public array $exchangeFilters = [];
    public array $symbols = [];
    public array $sors = [];

    private function decodeRateLimitsGroup(string $data, int &$offset): array
    {
        $blockLength = unpack('v', substr($data, $offset, 2))[1];
        $offset += 2;
        $numInGroup = unpack('V', substr($data, $offset, 4))[1];
        $offset += 4;

        $items = [];
        for ($i = 0; $i < $numInGroup; $i++) {
            $itemStart = $offset;
            $item = new RateLimits();

            $item->intervalNum = unpack('C', substr($data, $offset, 1))[1];
            $offset += 1;
            $item->rateLimit = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;

            // Skip to next block for forward compatibility
            $offset = $itemStart + $blockLength;
            $items[] = $item;
        }

        return $items;
    }

    private function decodeExchangeFiltersGroup(string $data, int &$offset): array
    {
        $blockLength = unpack('v', substr($data, $offset, 2))[1];
        $offset += 2;
        $numInGroup = unpack('V', substr($data, $offset, 4))[1];
        $offset += 4;

        $items = [];
        for ($i = 0; $i < $numInGroup; $i++) {
            $itemStart = $offset;
            $item = new ExchangeFilters();


            // Skip to next block for forward compatibility
            $offset = $itemStart + $blockLength;
            $items[] = $item;
        }

        return $items;
    }

    private function decodeSymbolsGroup(string $data, int &$offset): array
    {
        $blockLength = unpack('v', substr($data, $offset, 2))[1];
        $offset += 2;
        $numInGroup = unpack('V', substr($data, $offset, 4))[1];
        $offset += 4;

        $items = [];
        for ($i = 0; $i < $numInGroup; $i++) {
            $itemStart = $offset;
            $item = new Symbols();

            $item->baseAssetPrecision = unpack('C', substr($data, $offset, 1))[1];
            $offset += 1;
            $item->quoteAssetPrecision = unpack('C', substr($data, $offset, 1))[1];
            $offset += 1;
            $item->baseCommissionPrecision = unpack('C', substr($data, $offset, 1))[1];
            $offset += 1;
            $item->quoteCommissionPrecision = unpack('C', substr($data, $offset, 1))[1];
            $offset += 1;

            // Skip to next block for forward compatibility
            $offset = $itemStart + $blockLength;
            $items[] = $item;
        }

        return $items;
    }

    private function decodeSorsGroup(string $data, int &$offset): array
    {
        $blockLength = unpack('v', substr($data, $offset, 2))[1];
        $offset += 2;
        $numInGroup = unpack('V', substr($data, $offset, 4))[1];
        $offset += 4;

        $items = [];
        for ($i = 0; $i < $numInGroup; $i++) {
            $itemStart = $offset;
            $item = new Sors();


            // Skip to next block for forward compatibility
            $offset = $itemStart + $blockLength;
            $items[] = $item;
        }

        return $items;
    }

    public function encode(): string
    {
        $buffer = '';


        return $buffer;
    }

    public function decode(string $data): void
    {
        $offset = 0;


        // Skip to end of block for forward compatibility
        $offset = 0;

        $this->rateLimits = $this->decodeRateLimitsGroup($data, $offset);
        $this->exchangeFilters = $this->decodeExchangeFiltersGroup($data, $offset);
        $this->symbols = $this->decodeSymbolsGroup($data, $offset);
        $this->sors = $this->decodeSorsGroup($data, $offset);
    }
}
