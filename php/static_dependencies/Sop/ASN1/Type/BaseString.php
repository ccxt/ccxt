<?php

declare(strict_types = 1);

namespace Sop\ASN1\Type;

use Sop\ASN1\Element;

/**
 * Base class for all string types.
 */
abstract class BaseString extends Element implements StringType
{
    /**
     * String value.
     *
     * @var string
     */
    protected $_string;

    /**
     * Constructor.
     *
     * @throws \InvalidArgumentException
     */
    public function __construct(string $string)
    {
        if (!$this->_validateString($string)) {
            throw new \InvalidArgumentException(
                sprintf('Not a valid %s string.', self::tagToName($this->_typeTag)));
        }
        $this->_string = $string;
    }

    /**
     * {@inheritdoc}
     */
    public function __toString(): string
    {
        return $this->string();
    }

    /**
     * Get the string value.
     */
    public function string(): string
    {
        return $this->_string;
    }

    /**
     * Check whether string is valid for the concrete type.
     */
    protected function _validateString(string $string): bool
    {
        // Override in derived classes
        return true;
    }
}
