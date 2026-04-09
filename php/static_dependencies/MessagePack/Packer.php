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

class Packer
{
    private const UTF8_REGEX = '/\A(?:
          [\x00-\x7F]++                      # ASCII
        | [\xC2-\xDF][\x80-\xBF]             # non-overlong 2-byte
        |  \xE0[\xA0-\xBF][\x80-\xBF]        # excluding overlongs
        | [\xE1-\xEC\xEE\xEF][\x80-\xBF]{2}  # straight 3-byte
        |  \xED[\x80-\x9F][\x80-\xBF]        # excluding surrogates
        |  \xF0[\x90-\xBF][\x80-\xBF]{2}     # planes 1-3
        | [\xF1-\xF3][\x80-\xBF]{3}          # planes 4-15
        |  \xF4[\x80-\x8F][\x80-\xBF]{2}     # plane 16
        )*+\z/x';

    /** @var bool */
    private $isDetectStrBin;

    /** @var bool */
    private $isForceStr;

    /** @var bool */
    private $isDetectArrMap;

    /** @var bool */
    private $isForceArr;

    /** @var bool */
    private $isForceFloat32;

    /** @var CanPack[] */
    private $transformers = [];

    /**
     * @param PackOptions|int|null $options
     * @param CanPack[] $transformers
     *
     * @throws InvalidOptionException
     */
    public function __construct($options = null, array $transformers = [])
    {
        if (\is_null($options)) {
            $options = PackOptions::fromDefaults();
        } elseif (!$options instanceof PackOptions) {
            $options = PackOptions::fromBitmask($options);
        }

        $this->isDetectStrBin = $options->isDetectStrBinMode();
        $this->isForceStr = $options->isForceStrMode();
        $this->isDetectArrMap = $options->isDetectArrMapMode();
        $this->isForceArr = $options->isForceArrMode();
        $this->isForceFloat32 = $options->isForceFloat32Mode();

        if ($transformers) {
            $this->transformers = $transformers;
        }
    }

    public function extendWith(CanPack $transformer, CanPack ...$transformers) : self
    {
        $new = clone $this;
        $new->transformers[] = $transformer;

        if ($transformers) {
            $new->transformers = \array_merge($new->transformers, $transformers);
        }

        return $new;
    }

    /**
     * @param mixed $value
     *
     * @return string
     */
    public function pack($value)
    {
        if (\is_int($value)) {
            return $this->packInt($value);
        }
        if (\is_string($value)) {
            if ('' === $value) {
                return $this->isForceStr || $this->isDetectStrBin ? "\xa0" : "\xc4\x00";
            }
            if ($this->isForceStr) {
                return $this->packStr($value);
            }
            if ($this->isDetectStrBin && \preg_match(self::UTF8_REGEX, $value)) {
                return $this->packStr($value);
            }

            return $this->packBin($value);
        }
        if (\is_array($value)) {
            if ([] === $value) {
                return $this->isDetectArrMap || $this->isForceArr ? "\x90" : "\x80";
            }
            if ($this->isDetectArrMap) {
                if (!isset($value[0]) && !\array_key_exists(0, $value)) {
                    return $this->packMap($value);
                }

                return \array_values($value) === $value
                    ? $this->packArray($value)
                    : $this->packMap($value);
            }

            return $this->isForceArr ? $this->packArray($value) : $this->packMap($value);
        }
        if (\is_null($value)) {
            return "\xc0";
        }
        if (\is_bool($value)) {
            return $value ? "\xc3" : "\xc2";
        }
        if (\is_float($value)) {
            return $this->packFloat($value);
        }
        if ($this->transformers) {
            foreach ($this->transformers as $transformer) {
                if (!\is_null($packed = $transformer->pack($this, $value))) {
                    return $packed;
                }
            }
        }
        if ($value instanceof CanBePacked) {
            return $value->pack($this);
        }

        throw PackingFailedException::unsupportedType($value);
    }

    /**
     * @return string
     */
    public function packNil()
    {
        return "\xc0";
    }

    /**
     * @param string $bool
     *
     * @return string
     */
    public function packBool($bool)
    {
        return $bool ? "\xc3" : "\xc2";
    }

    /**
     * @param int $int
     *
     * @return string
     */
    public function packInt($int)
    {
        if ($int >= 0) {
            if ($int <= 0x7f) {
                return \chr($int);
            }
            if ($int <= 0xff) {
                return "\xcc".\chr($int);
            }
            if ($int <= 0xffff) {
                return "\xcd".\chr($int >> 8).\chr($int);
            }
            if ($int <= 0xffffffff) {
                return \pack('CN', 0xce, $int);
            }

            return \pack('CJ', 0xcf, $int);
        }

        if ($int >= -0x20) {
            return \chr(0xe0 | $int);
        }
        if ($int >= -0x80) {
            return "\xd0".\chr($int);
        }
        if ($int >= -0x8000) {
            return "\xd1".\chr($int >> 8).\chr($int);
        }
        if ($int >= -0x80000000) {
            return \pack('CN', 0xd2, $int);
        }

        return \pack('CJ', 0xd3, $int);
    }

    /**
     * @param float $float
     *
     * @return string
     */
    public function packFloat($float)
    {
        return $this->isForceFloat32
            ? "\xca".\pack('G', $float)
            : "\xcb".\pack('E', $float);
    }

    /**
     * @param float $float
     *
     * @return string
     */
    public function packFloat32($float)
    {
        return "\xca".\pack('G', $float);
    }

    /**
     * @param float $float
     *
     * @return string
     */
    public function packFloat64($float)
    {
        return "\xcb".\pack('E', $float);
    }

    /**
     * @param string $str
     *
     * @return string
     */
    public function packStr($str)
    {
        $length = \strlen($str);

        if ($length < 32) {
            return \chr(0xa0 | $length).$str;
        }
        if ($length <= 0xff) {
            return "\xd9".\chr($length).$str;
        }
        if ($length <= 0xffff) {
            return "\xda".\chr($length >> 8).\chr($length).$str;
        }

        return \pack('CN', 0xdb, $length).$str;
    }

    /**
     * @param string $str
     *
     * @return string
     */
    public function packBin($str)
    {
        $length = \strlen($str);

        if ($length <= 0xff) {
            return "\xc4".\chr($length).$str;
        }
        if ($length <= 0xffff) {
            return "\xc5".\chr($length >> 8).\chr($length).$str;
        }

        return \pack('CN', 0xc6, $length).$str;
    }

    /**
     * @param array $array
     *
     * @return string
     */
    public function packArray($array)
    {
        $data = $this->packArrayHeader(\count($array));

        foreach ($array as $val) {
            $data .= $this->pack($val);
        }

        return $data;
    }

    /**
     * @param int $size
     *
     * @return string
     */
    public function packArrayHeader($size)
    {
        if ($size <= 0xf) {
            return \chr(0x90 | $size);
        }
        if ($size <= 0xffff) {
            return "\xdc".\chr($size >> 8).\chr($size);
        }

        return \pack('CN', 0xdd, $size);
    }

    /**
     * @param array $map
     *
     * @return string
     */
    public function packMap($map)
    {
        $data = $this->packMapHeader(\count($map));

        if ($this->isForceStr) {
            foreach ($map as $key => $val) {
                $data .= \is_string($key) ? $this->packStr($key) : $this->packInt($key);
                $data .= $this->pack($val);
            }

            return $data;
        }

        if ($this->isDetectStrBin) {
            foreach ($map as $key => $val) {
                $data .= \is_string($key)
                    ? (\preg_match(self::UTF8_REGEX, $key) ? $this->packStr($key) : $this->packBin($key))
                    : $this->packInt($key);
                $data .= $this->pack($val);
            }

            return $data;
        }

        foreach ($map as $key => $val) {
            $data .= \is_string($key) ? $this->packBin($key) : $this->packInt($key);
            $data .= $this->pack($val);
        }

        return $data;
    }

    /**
     * @param int $size
     *
     * @return string
     */
    public function packMapHeader($size)
    {
        if ($size <= 0xf) {
            return \chr(0x80 | $size);
        }
        if ($size <= 0xffff) {
            return "\xde".\chr($size >> 8).\chr($size);
        }

        return \pack('CN', 0xdf, $size);
    }

    /**
     * @param int $type
     * @param string $data
     *
     * @return string
     */
    public function packExt($type, $data)
    {
        $length = \strlen($data);

        switch ($length) {
            case 1: return "\xd4".\chr($type).$data;
            case 2: return "\xd5".\chr($type).$data;
            case 4: return "\xd6".\chr($type).$data;
            case 8: return "\xd7".\chr($type).$data;
            case 16: return "\xd8".\chr($type).$data;
        }

        if ($length <= 0xff) {
            return "\xc7".\chr($length).\chr($type).$data;
        }
        if ($length <= 0xffff) {
            return \pack('CnC', 0xc8, $length, $type).$data;
        }

        return \pack('CNC', 0xc9, $length, $type).$data;
    }
}
