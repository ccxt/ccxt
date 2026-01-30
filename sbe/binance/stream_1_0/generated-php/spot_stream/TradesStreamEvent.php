<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class Trades
{
    public int|float|null $id = null;
    public int|float|null $price = null;
    public int|float|null $qty = null;
}

class TradesStreamEvent
{
    public const TEMPLATE_ID = 10000;
    public const SCHEMA_ID = 1;
    public const SCHEMA_VERSION = 0;
    public const BLOCK_LENGTH = 18;

    public int|float|array|null $eventTime = null;
    public int|float|array|null $transactTime = null;
    public int|float|array|null $priceExponent = null;
    public int|float|array|null $qtyExponent = null;
    public array $trades = [];
    public string $symbol = '';

    private function decodeTradesGroup(string $data, int &$offset): array
    {
        $blockLength = unpack('v', substr($data, $offset, 2))[1];
        $offset += 2;
        $numInGroup = unpack('V', substr($data, $offset, 4))[1];
        $offset += 4;

        $items = [];
        for ($i = 0; $i < $numInGroup; $i++) {
            $itemStart = $offset;
            $item = new Trades();

            $item->id = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->price = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->qty = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;

            // Skip to next block for forward compatibility
            $offset = $itemStart + $blockLength;
            $items[] = $item;
        }

        return $items;
    }

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

        if ($this->eventTime !== null) {
            $buffer .= pack('q', $this->eventTime);
        }
        if ($this->transactTime !== null) {
            $buffer .= pack('q', $this->transactTime);
        }
        if ($this->priceExponent !== null) {
            $buffer .= pack('c', $this->priceExponent);
        }
        if ($this->qtyExponent !== null) {
            $buffer .= pack('c', $this->qtyExponent);
        }

        return $buffer;
    }

    public function decode(string $data): void
    {
        $offset = 0;

        $this->eventTime = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->transactTime = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->priceExponent = unpack('c', substr($data, $offset, 1))[1];
        $offset += 1;
        $this->qtyExponent = unpack('c', substr($data, $offset, 1))[1];
        $offset += 1;

        // Skip to end of block for forward compatibility
        $offset = 18;

        $this->trades = $this->decodeTradesGroup($data, $offset);

        $this->symbol = $this->decodeVarData($data, $offset);
    }
}
