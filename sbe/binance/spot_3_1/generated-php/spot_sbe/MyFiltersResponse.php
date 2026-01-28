<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class ExchangeFilters
{
}

class SymbolFilters
{
}

class AssetFilters
{
}

class MyFiltersResponse
{
    public const TEMPLATE_ID = 105;
    public const SCHEMA_ID = 3;
    public const SCHEMA_VERSION = 1;
    public const BLOCK_LENGTH = 0;

    public array $exchangeFilters = [];
    public array $symbolFilters = [];
    public array $assetFilters = [];

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

    private function decodeSymbolFiltersGroup(string $data, int &$offset): array
    {
        $blockLength = unpack('v', substr($data, $offset, 2))[1];
        $offset += 2;
        $numInGroup = unpack('V', substr($data, $offset, 4))[1];
        $offset += 4;

        $items = [];
        for ($i = 0; $i < $numInGroup; $i++) {
            $itemStart = $offset;
            $item = new SymbolFilters();


            // Skip to next block for forward compatibility
            $offset = $itemStart + $blockLength;
            $items[] = $item;
        }

        return $items;
    }

    private function decodeAssetFiltersGroup(string $data, int &$offset): array
    {
        $blockLength = unpack('v', substr($data, $offset, 2))[1];
        $offset += 2;
        $numInGroup = unpack('V', substr($data, $offset, 4))[1];
        $offset += 4;

        $items = [];
        for ($i = 0; $i < $numInGroup; $i++) {
            $itemStart = $offset;
            $item = new AssetFilters();


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

        $this->exchangeFilters = $this->decodeExchangeFiltersGroup($data, $offset);
        $this->symbolFilters = $this->decodeSymbolFiltersGroup($data, $offset);
        $this->assetFilters = $this->decodeAssetFiltersGroup($data, $offset);
    }
}
