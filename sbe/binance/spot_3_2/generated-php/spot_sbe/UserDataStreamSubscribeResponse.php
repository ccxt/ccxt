<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class UserDataStreamSubscribeResponse
{
    public const TEMPLATE_ID = 503;
    public const SCHEMA_ID = 3;
    public const SCHEMA_VERSION = 2;
    public const BLOCK_LENGTH = 2;

    public int|float|array|null $subscriptionId = null;

    public function encode(): string
    {
        $buffer = '';

        if ($this->subscriptionId !== null) {
            $buffer .= pack('v', $this->subscriptionId);
        }

        return $buffer;
    }

    public function decode(string $data): void
    {
        $offset = 0;

        $this->subscriptionId = unpack('v', substr($data, $offset, 2))[1];
        $offset += 2;

        // Skip to end of block for forward compatibility
        $offset = 2;

    }
}
