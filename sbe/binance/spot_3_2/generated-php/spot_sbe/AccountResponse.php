<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class Balances
{
    public int|float|null $exponent = null;
    public int|float|null $free = null;
    public int|float|null $locked = null;
}

class Permissions
{
}

class ReduceOnlyAssets
{
}

class AccountResponse
{
    public const TEMPLATE_ID = 400;
    public const SCHEMA_ID = 3;
    public const SCHEMA_VERSION = 2;
    public const BLOCK_LENGTH = 64;

    public int|float|array|null $commissionExponent = null;
    public int|float|array|null $commissionRateMaker = null;
    public int|float|array|null $commissionRateTaker = null;
    public int|float|array|null $commissionRateBuyer = null;
    public int|float|array|null $commissionRateSeller = null;
    public int|float|array|null $canTrade = null;
    public int|float|array|null $canWithdraw = null;
    public int|float|array|null $canDeposit = null;
    public int|float|array|null $brokered = null;
    public int|float|array|null $requireSelfTradePrevention = null;
    public int|float|array|null $preventSor = null;
    public int|float|array|null $updateTime = null;
    public int|float|array|null $accountType = null;
    public int|float|array|null $tradeGroupId = null;
    public int|float|array|null $uid = null;
    public array $balances = [];
    public array $permissions = [];
    public array $reduceOnlyAssets = [];

    private function decodeBalancesGroup(string $data, int &$offset): array
    {
        $blockLength = unpack('v', substr($data, $offset, 2))[1];
        $offset += 2;
        $numInGroup = unpack('V', substr($data, $offset, 4))[1];
        $offset += 4;

        $items = [];
        for ($i = 0; $i < $numInGroup; $i++) {
            $itemStart = $offset;
            $item = new Balances();

            $item->exponent = unpack('c', substr($data, $offset, 1))[1];
            $offset += 1;
            $item->free = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;
            $item->locked = unpack('q', substr($data, $offset, 8))[1];
            $offset += 8;

            // Skip to next block for forward compatibility
            $offset = $itemStart + $blockLength;
            $items[] = $item;
        }

        return $items;
    }

    private function decodePermissionsGroup(string $data, int &$offset): array
    {
        $blockLength = unpack('v', substr($data, $offset, 2))[1];
        $offset += 2;
        $numInGroup = unpack('V', substr($data, $offset, 4))[1];
        $offset += 4;

        $items = [];
        for ($i = 0; $i < $numInGroup; $i++) {
            $itemStart = $offset;
            $item = new Permissions();


            // Skip to next block for forward compatibility
            $offset = $itemStart + $blockLength;
            $items[] = $item;
        }

        return $items;
    }

    private function decodeReduceOnlyAssetsGroup(string $data, int &$offset): array
    {
        $blockLength = unpack('v', substr($data, $offset, 2))[1];
        $offset += 2;
        $numInGroup = unpack('V', substr($data, $offset, 4))[1];
        $offset += 4;

        $items = [];
        for ($i = 0; $i < $numInGroup; $i++) {
            $itemStart = $offset;
            $item = new ReduceOnlyAssets();


            // Skip to next block for forward compatibility
            $offset = $itemStart + $blockLength;
            $items[] = $item;
        }

        return $items;
    }

    public function encode(): string
    {
        $buffer = '';

        if ($this->commissionExponent !== null) {
            $buffer .= pack('c', $this->commissionExponent);
        }
        if ($this->commissionRateMaker !== null) {
            $buffer .= pack('q', $this->commissionRateMaker);
        }
        if ($this->commissionRateTaker !== null) {
            $buffer .= pack('q', $this->commissionRateTaker);
        }
        if ($this->commissionRateBuyer !== null) {
            $buffer .= pack('q', $this->commissionRateBuyer);
        }
        if ($this->commissionRateSeller !== null) {
            $buffer .= pack('q', $this->commissionRateSeller);
        }
        if ($this->updateTime !== null) {
            $buffer .= pack('q', $this->updateTime);
        }
        if ($this->tradeGroupId !== null) {
            $buffer .= pack('q', $this->tradeGroupId);
        }
        if ($this->uid !== null) {
            $buffer .= pack('q', $this->uid);
        }

        return $buffer;
    }

    public function decode(string $data): void
    {
        $offset = 0;

        $this->commissionExponent = unpack('c', substr($data, $offset, 1))[1];
        $offset += 1;
        $this->commissionRateMaker = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->commissionRateTaker = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->commissionRateBuyer = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->commissionRateSeller = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->updateTime = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->tradeGroupId = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->uid = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;

        // Skip to end of block for forward compatibility
        $offset = 64;

        $this->balances = $this->decodeBalancesGroup($data, $offset);
        $this->permissions = $this->decodePermissionsGroup($data, $offset);
        $this->reduceOnlyAssets = $this->decodeReduceOnlyAssetsGroup($data, $offset);
    }
}
