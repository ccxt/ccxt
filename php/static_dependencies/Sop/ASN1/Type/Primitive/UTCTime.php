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
 * Implements *UTCTime* type.
 */
class UTCTime extends BaseTime
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
        '(\d\d)' . // YY
        '(\d\d)' . // MM
        '(\d\d)' . // DD
        '(\d\d)' . // hh
        '(\d\d)' . // mm
        '(\d\d)' . // ss
        'Z' . // TZ
        '$#';

    /**
     * Constructor.
     */
    public function __construct(\DateTimeImmutable $dt)
    {
        $this->_typeTag = self::TYPE_UTC_TIME;
        parent::__construct($dt);
    }

    /**
     * {@inheritdoc}
     */
    protected function _encodedContentDER(): string
    {
        $dt = $this->_dateTime->setTimezone(self::_createTimeZone(self::TZ_UTC));
        return $dt->format('ymdHis\\Z');
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
            throw new DecodeException('Invalid UTCTime format.');
        }
        [, $year, $month, $day, $hour, $minute, $second] = $match;
        $time = $year . $month . $day . $hour . $minute . $second . self::TZ_UTC;
        $dt = \DateTimeImmutable::createFromFormat('!ymdHisT', $time,
            self::_createTimeZone(self::TZ_UTC));
        if (!$dt) {
            throw new DecodeException('Failed to decode UTCTime: ' .
                self::_getLastDateTimeImmutableErrorsStr());
        }
        $offset = $idx;
        return new self($dt);
    }
}
