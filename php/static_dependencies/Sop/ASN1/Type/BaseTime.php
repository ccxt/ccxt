<?php

declare(strict_types = 1);

namespace Sop\ASN1\Type;

use Sop\ASN1\Element;

/**
 * Base class for all types representing a point in time.
 */
abstract class BaseTime extends Element implements TimeType
{
    /**
     * UTC timezone.
     *
     * @var string
     */
    const TZ_UTC = 'UTC';

    /**
     * Date and time.
     *
     * @var \DateTimeImmutable
     */
    protected $_dateTime;

    /**
     * Constructor.
     */
    public function __construct(\DateTimeImmutable $dt)
    {
        $this->_dateTime = $dt;
    }

    /**
     * {@inheritdoc}
     */
    public function __toString(): string
    {
        return $this->string();
    }

    /**
     * Initialize from datetime string.
     *
     * @see http://php.net/manual/en/datetime.formats.php
     *
     * @param string      $time Time string
     * @param null|string $tz   timezone, if null use default
     *
     * @throws \RuntimeException
     */
    public static function fromString(string $time, ?string $tz = null): self
    {
        try {
            if (!isset($tz)) {
                $tz = date_default_timezone_get();
            }
            return new static(
                new \DateTimeImmutable($time, self::_createTimeZone($tz)));
        } catch (\Exception $e) {
            throw new \RuntimeException(
                'Failed to create DateTime: ' .
                self::_getLastDateTimeImmutableErrorsStr(), 0, $e);
        }
    }

    /**
     * Get the date and time.
     */
    public function dateTime(): \DateTimeImmutable
    {
        return $this->_dateTime;
    }

    /**
     * Get the date and time as a type specific string.
     */
    public function string(): string
    {
        return $this->_encodedContentDER();
    }

    /**
     * Create `DateTimeZone` object from string.
     *
     * @throws \UnexpectedValueException If timezone is invalid
     */
    protected static function _createTimeZone(string $tz): \DateTimeZone
    {
        try {
            return new \DateTimeZone($tz);
        } catch (\Exception $e) {
            throw new \UnexpectedValueException('Invalid timezone.', 0, $e);
        }
    }

    /**
     * Get last error caused by `DateTimeImmutable`.
     */
    protected static function _getLastDateTimeImmutableErrorsStr(): string
    {
        $errors = \DateTimeImmutable::getLastErrors()['errors'];
        return implode(', ', $errors);
    }
}
