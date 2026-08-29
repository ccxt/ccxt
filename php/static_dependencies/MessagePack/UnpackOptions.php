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

final class UnpackOptions
{
    public const BIGINT_AS_STR = 0b001;
    public const BIGINT_AS_GMP = 0b010;
    public const BIGINT_AS_DEC = 0b100;

    /** @var int */
    private $bigIntMode;

    /**
     * @param int $bigIntMode
     */
    private function __construct($bigIntMode)
    {
        $this->bigIntMode = $bigIntMode;
    }

    public static function fromDefaults() : self
    {
        return new self(self::BIGINT_AS_STR);
    }

    public static function fromBitmask(int $bitmask) : self
    {
        return new self(
            self::getSingleOption('bigint', $bitmask,
                self::BIGINT_AS_STR | self::BIGINT_AS_GMP | self::BIGINT_AS_DEC
            ) ?: self::BIGINT_AS_STR
        );
    }

    public function isBigIntAsStrMode() : bool
    {
        return self::BIGINT_AS_STR === $this->bigIntMode;
    }

    public function isBigIntAsGmpMode() : bool
    {
        return self::BIGINT_AS_GMP === $this->bigIntMode;
    }

    public function isBigIntAsDecMode() : bool
    {
        return self::BIGINT_AS_DEC === $this->bigIntMode;
    }

    private static function getSingleOption(string $name, int $bitmask, int $validBitmask) : int
    {
        $option = $bitmask & $validBitmask;
        if ($option === ($option & -$option)) {
            return $option;
        }

        static $map = [
            self::BIGINT_AS_STR => 'BIGINT_AS_STR',
            self::BIGINT_AS_GMP => 'BIGINT_AS_GMP',
            self::BIGINT_AS_DEC => 'BIGINT_AS_DEC',
        ];

        $validOptions = [];
        for ($i = $validBitmask & -$validBitmask; $i <= $validBitmask; $i <<= 1) {
            $validOptions[] = __CLASS__.'::'.$map[$i];
        }

        throw InvalidOptionException::outOfRange($name, $validOptions);
    }
}
