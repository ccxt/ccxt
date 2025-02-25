<?php

declare(strict_types = 1);

namespace Sop\ASN1\Type;

use Sop\ASN1\Component\Identifier;
use Sop\ASN1\Element;
use Sop\ASN1\Type\Tagged\ExplicitTagging;
use Sop\ASN1\Type\Tagged\ImplicitTagging;

/**
 * Base class for context-specific types.
 */
abstract class TaggedType extends Element
{
    /**
     * Check whether element supports explicit tagging.
     *
     * @param null|int $expectedTag Optional outer tag expectation
     *
     * @throws \UnexpectedValueException If expectation fails
     */
    public function expectExplicit(?int $expectedTag = null): ExplicitTagging
    {
        $el = $this;
        if (!$el instanceof ExplicitTagging) {
            throw new \UnexpectedValueException(
                "Element doesn't implement explicit tagging.");
        }
        if (isset($expectedTag)) {
            $el->expectTagged($expectedTag);
        }
        return $el;
    }

    /**
     * Get the wrapped inner element employing explicit tagging.
     *
     * @param null|int $expectedTag Optional outer tag expectation
     *
     * @throws \UnexpectedValueException If expectation fails
     */
    public function asExplicit(?int $expectedTag = null): UnspecifiedType
    {
        return $this->expectExplicit($expectedTag)->explicit();
    }

    /**
     * Check whether element supports implicit tagging.
     *
     * @param null|int $expectedTag Optional outer tag expectation
     *
     * @throws \UnexpectedValueException If expectation fails
     */
    public function expectImplicit(?int $expectedTag = null): ImplicitTagging
    {
        $el = $this;
        if (!$el instanceof ImplicitTagging) {
            throw new \UnexpectedValueException(
                "Element doesn't implement implicit tagging.");
        }
        if (isset($expectedTag)) {
            $el->expectTagged($expectedTag);
        }
        return $el;
    }

    /**
     * Get the wrapped inner element employing implicit tagging.
     *
     * @param int      $tag           Type tag of the inner element
     * @param null|int $expectedTag   Optional outer tag expectation
     * @param int      $expectedClass Optional inner type class expectation
     *
     * @throws \UnexpectedValueException If expectation fails
     */
    public function asImplicit(int $tag, ?int $expectedTag = null,
        int $expectedClass = Identifier::CLASS_UNIVERSAL): UnspecifiedType
    {
        return $this->expectImplicit($expectedTag)->implicit($tag,
            $expectedClass);
    }
}
