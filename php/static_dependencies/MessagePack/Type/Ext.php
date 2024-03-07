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

final class Ext implements CanBePacked
{
    /** @readonly */
    public $type;

    /** @readonly */
    public $data;

    public function __construct(int $type, string $data)
    {
        $this->type = $type;
        $this->data = $data;
    }

    public function pack(Packer $packer) : string
    {
        return $packer->packExt($this->type, $this->data);
    }
}
