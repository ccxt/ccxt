<?php

/**
 * This file is part of the rybakit/msgpack.php package.
 *
 * (c) Eugene Leonovich <gen.work@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace MessagePack\Exception;

class UnpackingFailedException extends \RuntimeException
{
    public static function unknownCode(int $code) : self
    {
        return new self(\sprintf('Unknown code: 0x%x', $code));
    }

    public static function unexpectedCode(int $code, string $type) : self
    {
        return new self(\sprintf('Unexpected %s code: 0x%x', $type, $code));
    }

    public static function invalidMapKeyType(int $code) : self
    {
        $type = (static function () use ($code) : ?string {
            if ($code >= 0x90 && $code <= 0x9f) {
                return 'array';
            }
            if ($code >= 0x80 && $code <= 0x8f) {
                return 'map';
            }

            switch ($code) {
                case 0xc0: return 'nil';
                case 0xc2:
                case 0xc3: return 'bool';
                case 0xca:
                case 0xcb: return 'float';
                case 0xdc:
                case 0xdd: return 'array';
                case 0xde:
                case 0xdf: return 'map';
                case 0xd4:
                case 0xd5:
                case 0xd6:
                case 0xd7:
                case 0xd8:
                case 0xc7:
                case 0xc8:
                case 0xc9: return 'ext';
            }

            return null;
        })();

        return new self('Invalid map key type: expected int, str or bin but got '.(\is_null($type) ? \sprintf('0x%x', $code) : \sprintf('%s (0x%x)', $type, $code)));
    }
}
