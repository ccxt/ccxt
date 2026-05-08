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

class PackingFailedException extends \RuntimeException
{
    /**
     * @param mixed $value
     */
    public static function unsupportedType($value) : self
    {
        return new self(\sprintf('Unsupported type "%s", maybe you forgot to register the type transformer or extension?',
            \is_object($value) ? \get_class($value) : \gettype($value)
        ));
    }
}
