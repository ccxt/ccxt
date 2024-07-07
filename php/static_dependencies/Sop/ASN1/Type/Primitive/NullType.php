<?php

declare(strict_types = 1);

namespace Sop\ASN1\Type\Primitive;

use Sop\ASN1\Component\Identifier;
use Sop\ASN1\Component\Length;
use Sop\ASN1\Element;
use Sop\ASN1\Exception\DecodeException;
use Sop\ASN1\Feature\ElementBase;
use Sop\ASN1\Type\PrimitiveType;
use Sop\ASN1\Type\UniversalClass;

/**
 * Implements *NULL* type.
 */
class NullType extends Element
{
    use UniversalClass;
    use PrimitiveType;

    /**
     * Constructor.
     */
    public function __construct()
    {
        $this->_typeTag = self::TYPE_NULL;
    }

    /**
     * {@inheritdoc}
     */
    protected function _encodedContentDER(): string
    {
        return '';
    }

    /**
     * {@inheritdoc}
     */
    protected static function _decodeFromDER(Identifier $identifier,
        string $data, int &$offset): ElementBase
    {
        $idx = $offset;
        if (!$identifier->isPrimitive()) {
            throw new DecodeException('Null value must be primitive.');
        }
        // null type has always zero length
        Length::expectFromDER($data, $idx, 0);
        $offset = $idx;
        return new self();
    }
}
