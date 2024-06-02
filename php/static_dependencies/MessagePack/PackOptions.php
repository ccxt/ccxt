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

final class PackOptions
{
    public const FORCE_STR         = 0b00000001;
    public const FORCE_BIN         = 0b00000010;
    public const DETECT_STR_BIN    = 0b00000100;
    public const FORCE_ARR         = 0b00001000;
    public const FORCE_MAP         = 0b00010000;
    public const DETECT_ARR_MAP    = 0b00100000;
    public const FORCE_FLOAT32     = 0b01000000;
    public const FORCE_FLOAT64     = 0b10000000;

    /** @var int */
    private $strBinMode;

    /** @var int */
    private $arrMapMode;

    /** @var int */
    private $floatMode;

    /**
     * @param int $strBinMode
     * @param int $arrMapMode
     * @param int $floatMode
     */
    private function __construct($strBinMode, $arrMapMode, $floatMode)
    {
        $this->strBinMode = $strBinMode;
        $this->arrMapMode = $arrMapMode;
        $this->floatMode = $floatMode;
    }

    public static function fromDefaults() : self
    {
        return new self(
            self::FORCE_STR,
            self::DETECT_ARR_MAP,
            self::FORCE_FLOAT64
        );
    }

    public static function fromBitmask(int $bitmask) : self
    {
        return new self(
            self::getSingleOption('str/bin', $bitmask,
                self::FORCE_STR | self::FORCE_BIN | self::DETECT_STR_BIN
            ) ?: self::FORCE_STR,

            self::getSingleOption('arr/map', $bitmask,
                self::FORCE_ARR | self::FORCE_MAP | self::DETECT_ARR_MAP
            ) ?: self::DETECT_ARR_MAP,

            self::getSingleOption('float', $bitmask,
                self::FORCE_FLOAT32 | self::FORCE_FLOAT64
            ) ?: self::FORCE_FLOAT64
        );
    }

    public function isDetectStrBinMode() : bool
    {
        return self::DETECT_STR_BIN === $this->strBinMode;
    }

    public function isForceStrMode() : bool
    {
        return self::FORCE_STR === $this->strBinMode;
    }

    public function isForceBinMode() : bool
    {
        return self::FORCE_BIN === $this->strBinMode;
    }

    public function isDetectArrMapMode() : bool
    {
        return self::DETECT_ARR_MAP === $this->arrMapMode;
    }

    public function isForceArrMode() : bool
    {
        return self::FORCE_ARR === $this->arrMapMode;
    }

    public function isForceMapMode() : bool
    {
        return self::FORCE_MAP === $this->arrMapMode;
    }

    public function isForceFloat32Mode() : bool
    {
        return self::FORCE_FLOAT32 === $this->floatMode;
    }

    private static function getSingleOption(string $name, int $bitmask, int $validBitmask) : int
    {
        $option = $bitmask & $validBitmask;
        if ($option === ($option & -$option)) {
            return $option;
        }

        static $map = [
            self::FORCE_STR => 'FORCE_STR',
            self::FORCE_BIN => 'FORCE_BIN',
            self::DETECT_STR_BIN => 'DETECT_STR_BIN',
            self::FORCE_ARR => 'FORCE_ARR',
            self::FORCE_MAP => 'FORCE_MAP',
            self::DETECT_ARR_MAP => 'DETECT_ARR_MAP',
            self::FORCE_FLOAT32 => 'FORCE_FLOAT32',
            self::FORCE_FLOAT64 => 'FORCE_FLOAT64',
        ];

        $validOptions = [];
        for ($i = $validBitmask & -$validBitmask; $i <= $validBitmask; $i <<= 1) {
            $validOptions[] = __CLASS__.'::'.$map[$i];
        }

        throw InvalidOptionException::outOfRange($name, $validOptions);
    }
}
