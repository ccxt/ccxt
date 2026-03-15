<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class Amendments
{
    public int|float|null $orderId = null;
    public int|float|null $executionId = null;
    public int|float|null $qtyExponent = null;
    public int|float|null $origQty = null;
    public int|float|null $newQty = null;
    public int|float|null $time = null;
}

class OrderAmendmentsResponse
{
    public const TEMPLATE_ID = 316;
    public const SCHEMA_ID = 3;
    public const SCHEMA_VERSION = 1;
    public const BLOCK_LENGTH = 0;

    public array $amendments = [];

    private function decodeAmendmentsGroup(string $data, int &$offset): array
    {
        $blockLength = unpack('v', substr($data, $offset, 2))[1];
        $offset += 2;
        $numInGroup = unpack('V', substr($data, $offset, 4))[1];
        $offset += 4;

        $items = [];
        for ($i = 0; $i < $numInGroup; $i++) {
            $itemStart = $offset;
            $item = new Amendments();

            $item->orderId = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->executionId = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->qtyExponent = unpack('c', substr($data, $offset, 1))[1];
            $offset += 1;
            $item->origQty = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->newQty = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->time = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;

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

        $this->amendments = $this->decodeAmendmentsGroup($data, $offset);
    }
}
