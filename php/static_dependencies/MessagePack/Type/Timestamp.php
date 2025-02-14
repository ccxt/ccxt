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

final class Timestamp
{
    private $seconds;
    private $nanoseconds;

    public function __construct(int $seconds, int $nanoseconds = 0)
    {
        $this->seconds = $seconds;
        $this->nanoseconds = $nanoseconds;
    }

    public static function now() : self
    {
        $date = new \DateTime();

        return new self($date->getTimestamp(), (int) $date->format('u') * 1000);
    }

    public static function fromDateTime(\DateTimeInterface $date) : self
    {
        return new self($date->getTimestamp(), (int) $date->format('u') * 1000);
    }

    public function getSeconds() : int
    {
        return $this->seconds;
    }

    public function getNanoseconds() : int
    {
        return $this->nanoseconds;
    }
}
