<?php

declare(strict_types = 1);

namespace Sop\ASN1\Type\Primitive;

use Sop\ASN1\Component\Identifier;
use Sop\ASN1\Component\Length;
use Sop\ASN1\Exception\DecodeException;
use Sop\ASN1\Feature\ElementBase;
use Sop\ASN1\Type\BaseTime;
use Sop\ASN1\Type\PrimitiveType;
use Sop\ASN1\Type\UniversalClass;

/**
 * Implements *GeneralizedTime* type.
 */
class GeneralizedTime extends BaseTime
{
    use UniversalClass;
    use PrimitiveType;

    /**
     * Regular expression to parse date.
     *
     * DER restricts format to UTC timezone (Z suffix).
     *
     * @var string
     */
    const REGEX = '#^' .
        '(\d\d\d\d)' . // YYYY
        '(\d\d)' . // MM
        '(\d\d)' . // DD
        '(\d\d)' . // hh
        '(\d\d)' . // mm
        '(\d\d)' . // ss
        '(?:\.(\d+))?' . // frac
        'Z' . // TZ
        '$#';

    /**
     * Cached formatted date.
     *
     * @var null|string
     */
    private $_formatted;

    /**
     * Constructor.
     */
    public function __construct(\DateTimeImmutable $dt)
    {
        $this->_typeTag = self::TYPE_GENERALIZED_TIME;
        parent::__construct($dt);
    }

    /**
     * Clear cached variables on clone.
     */
    public function __clone()
    {
        $this->_formatted = null;
    }

    /**
     * {@inheritdoc}
     */
    protected function _encodedContentDER(): string
    {
        if (!isset($this->_formatted)) {
            $dt = $this->_dateTime->setTimezone(
                self::_createTimeZone(self::TZ_UTC));
            $this->_formatted = $dt->format('YmdHis');
            // if fractions were used
            $frac = $dt->format('u');
            if (0 !== intval($frac)) {
                $frac = rtrim($frac, '0');
                $this->_formatted .= ".{$frac}";
            }
            // timezone
            $this->_formatted .= 'Z';
        }
        return $this->_formatted;
    }

    /**
     * {@inheritdoc}
     */
    protected static function _decodeFromDER(Identifier $identifier,
        string $data, int &$offset): ElementBase
    {
        $idx = $offset;
        $length = Length::expectFromDER($data, $idx)->intLength();
        $str = substr($data, $idx, $length);
        $idx += $length;
        /** @var string[] $match */
        if (!preg_match(self::REGEX, $str, $match)) {
            throw new DecodeException('Invalid GeneralizedTime format.');
        }
        [, $year, $month, $day, $hour, $minute, $second] = $match;
        // if fractions match, there's at least one digit
        if (isset($match[7])) {
            $frac = $match[7];
            // DER restricts trailing zeroes in fractional seconds component
            if ('0' === $frac[strlen($frac) - 1]) {
                throw new DecodeException(
                    'Fractional seconds must omit trailing zeroes.');
            }
            $frac = $frac;
        } else {
            $frac = '0';
        }
        $time = $year . $month . $day . $hour . $minute . $second . '.' . $frac .
            self::TZ_UTC;
        $dt = \DateTimeImmutable::createFromFormat('!YmdHis.uT', $time,
            self::_createTimeZone(self::TZ_UTC));
        if (!$dt) {
            throw new DecodeException(
                'Failed to decode GeneralizedTime: ' .
                self::_getLastDateTimeImmutableErrorsStr());
        }
        $offset = $idx;
        return new self($dt);
    }
}
