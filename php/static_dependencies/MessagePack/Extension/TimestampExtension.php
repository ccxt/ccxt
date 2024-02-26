<?php

/**
 * This file is part of the rybakit/msgpack.php package.
 *
 * (c) Eugene Leonovich <gen.work@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace MessagePack\Extension;

use MessagePack\BufferUnpacker;
use MessagePack\Extension;
use MessagePack\Packer;
use MessagePack\Type\Timestamp;

final class TimestampExtension implements Extension
{
    private const TYPE = -1;

    public function getType() : int
    {
        return self::TYPE;
    }

    public function pack(Packer $packer, $value) : ?string
    {
        if (!$value instanceof Timestamp) {
            return null;
        }

        $sec = $value->getSeconds();
        $nsec = $value->getNanoseconds();

        if ($sec >> 34) {
            return $packer->packExt(self::TYPE, \pack('NJ', $nsec, $sec));
        }

        return (0 === $nsec && $sec <= 0xffffffff)
            ? $packer->packExt(self::TYPE, \pack('N', $sec))
            : $packer->packExt(self::TYPE, \pack('J', ($nsec << 34) | $sec));
    }

    /**
     * @return Timestamp
     */
    public function unpackExt(BufferUnpacker $unpacker, int $extLength)
    {
        if (4 === $extLength) {
            $data = $unpacker->read(4);

            $sec = \ord($data[0]) << 24
                | \ord($data[1]) << 16
                | \ord($data[2]) << 8
                | \ord($data[3]);

            return new Timestamp($sec);
        }
        if (8 === $extLength) {
            $data = $unpacker->read(8);

            $num = \unpack('J', $data)[1];
            $nsec = $num >> 34;
            if ($nsec < 0) {
                $nsec += 0x40000000;
            }

            return new Timestamp($num & 0x3ffffffff, $nsec);
        }

        $data = $unpacker->read(12);

        $nsec = \ord($data[0]) << 24
            | \ord($data[1]) << 16
            | \ord($data[2]) << 8
            | \ord($data[3]);

        return new Timestamp(\unpack('J', $data, 4)[1], $nsec);
    }
}
