<?php

/**
 * This file is part of the rybakit/msgpack.php package.
 *
 * (c) Eugene Leonovich <gen.work@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace MessagePack\TypeTransformer;

use MessagePack\CanPack;
use MessagePack\Packer;

class TraversableTransformer implements CanPack
{
    /** @var bool */
    private $packToMap;

    /**
     * @param bool $packToMap
     */
    private function __construct($packToMap)
    {
        $this->packToMap = $packToMap;
    }

    public static function toMap() : self
    {
        return new self(true);
    }

    public static function toArray() : self
    {
        return new self(false);
    }

    public function pack(Packer $packer, $value) : ?string
    {
        if (!$value instanceof \Traversable) {
            return null;
        }

        return $this->packToMap
            ? self::packMap($packer, $value)
            : self::packArray($packer, $value);
    }

    private static function packArray(Packer $packer, \Traversable $traversable) : string
    {
        $count = 0;
        $items = '';
        foreach ($traversable as $value) {
            $items .= $packer->pack($value);
            ++$count;
        }

        return $packer->packArrayHeader($count).$items;
    }

    private static function packMap(Packer $packer, \Traversable $traversable) : string
    {
        $count = 0;
        $items = '';
        foreach ($traversable as $key => $value) {
            $items .= $packer->pack($key);
            $items .= $packer->pack($value);
            ++$count;
        }

        return $packer->packMapHeader($count).$items;
    }
}
