<?php
/**
 * Generated SBE (Simple Binary Encoding) message codec.
 */

class ErrorResponse
{
    public const TEMPLATE_ID = 100;
    public const SCHEMA_ID = 3;
    public const SCHEMA_VERSION = 1;
    public const BLOCK_LENGTH = 18;

    public int|float|array|null $code = null;
    public int|float|array|null $serverTime = null;
    public int|float|array|null $retryAfter = null;
    public string $msg = '';
    public string $data = '';

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

        if ($this->code !== null) {
            $buffer .= pack('s', $this->code);
        }
        if ($this->serverTime !== null) {
            $buffer .= pack('q', $this->serverTime);
        }
        if ($this->retryAfter !== null) {
            $buffer .= pack('q', $this->retryAfter);
        }

        return $buffer;
    }

    public function decode(string $data): void
    {
        $offset = 0;

        $this->code = unpack('s', substr($data, $offset, 2))[1];
        $offset += 2;
        $this->serverTime = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;
        $this->retryAfter = unpack('q', substr($data, $offset, 8))[1];
        $offset += 8;

        // Skip to end of block for forward compatibility
        $offset = 18;


        $this->msg = $this->decodeVarData($data, $offset);
        $this->data = $this->decodeVarData($data, $offset);
    }
}
