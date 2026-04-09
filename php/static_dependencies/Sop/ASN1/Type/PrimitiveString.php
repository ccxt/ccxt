<?php

declare(strict_types = 1);

namespace Sop\ASN1\Type;

use Sop\ASN1\Component\Identifier;
use Sop\ASN1\Component\Length;
use Sop\ASN1\Exception\DecodeException;
use Sop\ASN1\Feature\ElementBase;

/**
 * Base class for primitive strings.
 *
 * Used by types that don't require special processing of the encoded string data.
 *
 * @internal
 */
abstract class PrimitiveString extends BaseString
{
    use PrimitiveType;

    /**
     * {@inheritdoc}
     */
    protected function _encodedContentDER(): string
    {
        return $this->_string;
    }

    /**
     * {@inheritdoc}
     */
    protected static function _decodeFromDER(Identifier $identifier,
        string $data, int &$offset): ElementBase
    {
        $idx = $offset;
        if (!$identifier->isPrimitive()) {
            throw new DecodeException('DER encoded string must be primitive.');
        }
        $length = Length::expectFromDER($data, $idx)->intLength();
        $str = $length ? substr($data, $idx, $length) : '';
        // substr should never return false, since length is
        // checked by Length::expectFromDER.
        assert(is_string($str), new DecodeException('substr'));
        $offset = $idx + $length;
        try {
            return new static($str);
        } catch (\InvalidArgumentException $e) {
            throw new DecodeException($e->getMessage(), 0, $e);
        }
    }
}
