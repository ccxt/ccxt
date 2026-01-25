<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class UserDataStreamSubscribeListenTokenResponse
{
    public const TEMPLATE_ID = 505;
    public const SCHEMA_ID = 3;
    public const SCHEMA_VERSION = 2;
    public const BLOCK_LENGTH = 10;

    public int|float|array|null $subscriptionId = null;
    public int|float|array|null $expirationTime = null;

    public function encode(): string
    {
        $buffer = '';

        if ($this->subscriptionId !== null) {
            $buffer .= pack('v', $this->subscriptionId);
        }
        if ($this->expirationTime !== null) {
            $buffer .= pack('q', $this->expirationTime);
        }

        return $buffer;
    }

    public function decode(string $data): void
    {
        $offset = 0;

        $this->subscriptionId = unpack('v', substr($data, $offset, 2))[1];
        $offset += 2;
        $this->expirationTime = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;

        // Skip to end of block for forward compatibility
        $offset = 10;

    }
}
