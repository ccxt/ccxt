<?php

/**
 * This file is part of the rybakit/msgpack.php package.
 *
 * (c) Eugene Leonovich <gen.work@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace MessagePack\Type;

use MessagePack\CanBePacked;
use MessagePack\Packer;

final class Map implements CanBePacked
{
    /** @readonly */
    public $map;

    public function __construct(array $map)
    {
        $this->map = $map;
    }

    public function pack(Packer $packer) : string
    {
        return $packer->packMap($this->map);
    }
}
