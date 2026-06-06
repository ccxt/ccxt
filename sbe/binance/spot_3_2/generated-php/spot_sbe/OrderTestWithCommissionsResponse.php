<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class OrderTestWithCommissionsResponse
{
    public const TEMPLATE_ID = 315;
    public const SCHEMA_ID = 3;
    public const SCHEMA_VERSION = 2;
    public const BLOCK_LENGTH = 60;

    public int|float|array|null $commissionExponent = null;
    public int|float|array|null $discountExponent = null;
    public int|float|array|null $standardCommissionForOrderMaker = null;
    public int|float|array|null $standardCommissionForOrderTaker = null;
    public int|float|array|null $taxCommissionForOrderMaker = null;
    public int|float|array|null $taxCommissionForOrderTaker = null;
    public int|float|array|null $discountEnabledForAccount = null;
    public int|float|array|null $discountEnabledForSymbol = null;
    public int|float|array|null $discount = null;
    public int|float|array|null $specialCommissionForOrderMaker = null;
    public int|float|array|null $specialCommissionForOrderTaker = null;
    public string $discountAsset = '';

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

        if ($this->commissionExponent !== null) {
            $buffer .= pack('c', $this->commissionExponent);
        }
        if ($this->discountExponent !== null) {
            $buffer .= pack('c', $this->discountExponent);
        }
        if ($this->standardCommissionForOrderMaker !== null) {
            $buffer .= pack('q', $this->standardCommissionForOrderMaker);
        }
        if ($this->standardCommissionForOrderTaker !== null) {
            $buffer .= pack('q', $this->standardCommissionForOrderTaker);
        }
        if ($this->taxCommissionForOrderMaker !== null) {
            $buffer .= pack('q', $this->taxCommissionForOrderMaker);
        }
        if ($this->taxCommissionForOrderTaker !== null) {
            $buffer .= pack('q', $this->taxCommissionForOrderTaker);
        }
        if ($this->discount !== null) {
            $buffer .= pack('q', $this->discount);
        }
        if ($this->specialCommissionForOrderMaker !== null) {
            $buffer .= pack('q', $this->specialCommissionForOrderMaker);
        }
        if ($this->specialCommissionForOrderTaker !== null) {
            $buffer .= pack('q', $this->specialCommissionForOrderTaker);
        }

        return $buffer;
    }

    public function decode(string $data): void
    {
        $offset = 0;

        $this->commissionExponent = unpack('c', substr($data, $offset, 1))[1];
        $offset += 1;
        $this->discountExponent = unpack('c', substr($data, $offset, 1))[1];
        $offset += 1;
        $this->standardCommissionForOrderMaker = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->standardCommissionForOrderTaker = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->taxCommissionForOrderMaker = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->taxCommissionForOrderTaker = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->discount = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->specialCommissionForOrderMaker = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->specialCommissionForOrderTaker = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;

        // Skip to end of block for forward compatibility
        $offset = 60;


        $this->discountAsset = $this->decodeVarData($data, $offset);
    }
}
