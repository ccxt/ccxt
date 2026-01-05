<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class AveragePriceResponse
{
    public const TEMPLATE_ID = 204;
    public const SCHEMA_ID = 3;
    public const SCHEMA_VERSION = 2;
    public const BLOCK_LENGTH = 25;

    public int|float|array|null $mins = null;
    public int|float|array|null $priceExponent = null;
    public int|float|array|null $price = null;
    public int|float|array|null $closeTime = null;

    public function encode(): string
    {
        $buffer = '';

        if ($this->mins !== null) {
            $buffer .= pack('q', $this->mins);
        }
        if ($this->priceExponent !== null) {
            $buffer .= pack('c', $this->priceExponent);
        }
        if ($this->price !== null) {
            $buffer .= pack('q', $this->price);
        }
        if ($this->closeTime !== null) {
            $buffer .= pack('q', $this->closeTime);
        }

        return $buffer;
    }

    public function decode(string $data): void
    {
        $offset = 0;

        $this->mins = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->priceExponent = unpack('c', substr($data, $offset, 1))[1];
        $offset += 1;
        $this->price = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->closeTime = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
    }
}
