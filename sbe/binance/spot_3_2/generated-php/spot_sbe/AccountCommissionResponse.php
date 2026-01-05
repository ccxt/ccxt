<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class AccountCommissionResponse
{
    public const TEMPLATE_ID = 405;
    public const SCHEMA_ID = 3;
    public const SCHEMA_VERSION = 2;
    public const BLOCK_LENGTH = 108;

    public int|float|array|null $commissionExponent = null;
    public int|float|array|null $discountExponent = null;
    public int|float|array|null $standardCommissionMaker = null;
    public int|float|array|null $standardCommissionTaker = null;
    public int|float|array|null $standardCommissionBuyer = null;
    public int|float|array|null $standardCommissionSeller = null;
    public int|float|array|null $taxCommissionMaker = null;
    public int|float|array|null $taxCommissionTaker = null;
    public int|float|array|null $taxCommissionBuyer = null;
    public int|float|array|null $taxCommissionSeller = null;
    public int|float|array|null $discountEnabledForAccount = null;
    public int|float|array|null $discountEnabledForSymbol = null;
    public int|float|array|null $discount = null;
    public int|float|array|null $specialCommissionMaker = null;
    public int|float|array|null $specialCommissionTaker = null;
    public int|float|array|null $specialCommissionBuyer = null;
    public int|float|array|null $specialCommissionSeller = null;
    public string $symbol = '';
    public string $discountAsset = '';

    public function encode(): string
    {
        $buffer = '';

        if ($this->commissionExponent !== null) {
            $buffer .= pack('c', $this->commissionExponent);
        }
        if ($this->discountExponent !== null) {
            $buffer .= pack('c', $this->discountExponent);
        }
        if ($this->standardCommissionMaker !== null) {
            $buffer .= pack('q', $this->standardCommissionMaker);
        }
        if ($this->standardCommissionTaker !== null) {
            $buffer .= pack('q', $this->standardCommissionTaker);
        }
        if ($this->standardCommissionBuyer !== null) {
            $buffer .= pack('q', $this->standardCommissionBuyer);
        }
        if ($this->standardCommissionSeller !== null) {
            $buffer .= pack('q', $this->standardCommissionSeller);
        }
        if ($this->taxCommissionMaker !== null) {
            $buffer .= pack('q', $this->taxCommissionMaker);
        }
        if ($this->taxCommissionTaker !== null) {
            $buffer .= pack('q', $this->taxCommissionTaker);
        }
        if ($this->taxCommissionBuyer !== null) {
            $buffer .= pack('q', $this->taxCommissionBuyer);
        }
        if ($this->taxCommissionSeller !== null) {
            $buffer .= pack('q', $this->taxCommissionSeller);
        }
        if ($this->discount !== null) {
            $buffer .= pack('q', $this->discount);
        }
        if ($this->specialCommissionMaker !== null) {
            $buffer .= pack('q', $this->specialCommissionMaker);
        }
        if ($this->specialCommissionTaker !== null) {
            $buffer .= pack('q', $this->specialCommissionTaker);
        }
        if ($this->specialCommissionBuyer !== null) {
            $buffer .= pack('q', $this->specialCommissionBuyer);
        }
        if ($this->specialCommissionSeller !== null) {
            $buffer .= pack('q', $this->specialCommissionSeller);
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
        $this->standardCommissionMaker = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->standardCommissionTaker = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->standardCommissionBuyer = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->standardCommissionSeller = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->taxCommissionMaker = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->taxCommissionTaker = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->taxCommissionBuyer = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->taxCommissionSeller = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->discount = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->specialCommissionMaker = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->specialCommissionTaker = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->specialCommissionBuyer = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->specialCommissionSeller = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
    }
}
