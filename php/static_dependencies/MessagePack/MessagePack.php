<?php

/**
 * This file is part of the rybakit/msgpack.php package.
 *
 * (c) Eugene Leonovich <gen.work@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace MessagePack;

use MessagePack\Exception\InvalidOptionException;
use MessagePack\Exception\PackingFailedException;
use MessagePack\Exception\UnpackingFailedException;
use MessagePack\Extension\TimestampExtension;

final class MessagePack
{
    /** @var Extension[]|null */
    private static $extensions;

    /**
     * @codeCoverageIgnore
     */
    private function __construct()
    {
    }

    /**
     * @param mixed $value
     * @param PackOptions|int|null $options
     *
     * @throws InvalidOptionException
     * @throws PackingFailedException
     */
    public static function pack($value, $options = null) : string
    {
        return (new Packer($options, self::getBuiltInExtensions()))->pack($value);
    }

    /**
     * @param UnpackOptions|int|null $options
     *
     * @throws InvalidOptionException
     * @throws UnpackingFailedException
     *
     * @return mixed
     */
    public static function unpack(string $data, $options = null)
    {
        return (new BufferUnpacker($data, $options, self::getBuiltInExtensions()))->unpack();
    }

    private static function getBuiltInExtensions() : array
    {
        return self::$extensions ?? self::$extensions = [
            new TimestampExtension(),
        ];
    }
}
