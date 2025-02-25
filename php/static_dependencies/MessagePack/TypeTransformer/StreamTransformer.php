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

class StreamTransformer implements CanPack
{
    public function pack(Packer $packer, $value) : ?string
    {
        return \is_resource($value) && 'stream' === \get_resource_type($value)
            ? $packer->packBin(\stream_get_contents($value))
            : null;
    }
}
