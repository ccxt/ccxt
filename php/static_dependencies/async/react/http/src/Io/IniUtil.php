<?php

namespace React\Http\Io;

/**
 * @internal
 */
final class IniUtil
{
    /**
     * Convert a ini like size to a numeric size in bytes.
     *
     * @param string $size
     * @return int
     */
    public static function iniSizeToBytes($size)
    {
        if (\is_numeric($size)) {
            return (int)$size;
        }

        $suffix = \strtoupper(\substr($size, -1));
        $strippedSize = \substr($size, 0, -1);

        if (!\is_numeric($strippedSize)) {
            throw new \InvalidArgumentException("$size is not a valid ini size");
        }

        if ($strippedSize <= 0) {
            throw new \InvalidArgumentException("Expect $size to be higher isn't zero or lower");
        }

        if ($suffix === 'K') {
            return $strippedSize * 1024;
        }
        if ($suffix === 'M') {
            return $strippedSize * 1024 * 1024;
        }
        if ($suffix === 'G') {
            return $strippedSize * 1024 * 1024 * 1024;
        }
        if ($suffix === 'T') {
            return $strippedSize * 1024  * 1024 * 1024 * 1024;
        }

        return (int)$size;
    }
}
