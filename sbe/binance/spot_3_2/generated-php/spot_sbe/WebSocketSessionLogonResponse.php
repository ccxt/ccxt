<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class WebSocketSessionLogonResponse
{
    public const TEMPLATE_ID = 51;
    public const SCHEMA_ID = 3;
    public const SCHEMA_VERSION = 2;
    public const BLOCK_LENGTH = 26;

    public int|float|array|null $authorizedSince = null;
    public int|float|array|null $connectedSince = null;
    public int|float|array|null $returnRateLimits = null;
    public int|float|array|null $serverTime = null;
    public int|float|array|null $userDataStream = null;
    public string $loggedOnApiKey = '';

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

        if ($this->authorizedSince !== null) {
            $buffer .= pack('q', $this->authorizedSince);
        }
        if ($this->connectedSince !== null) {
            $buffer .= pack('q', $this->connectedSince);
        }
        if ($this->serverTime !== null) {
            $buffer .= pack('q', $this->serverTime);
        }

        return $buffer;
    }

    public function decode(string $data): void
    {
        $offset = 0;

        $this->authorizedSince = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->connectedSince = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->serverTime = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;

        // Skip to end of block for forward compatibility
        $offset = 26;


        $this->loggedOnApiKey = $this->decodeVarData($data, $offset);
    }
}
