<?php

declare(strict_types = 1);

namespace Sop\ASN1\Type\Tagged;

use Sop\ASN1\Component\Identifier;
use Sop\ASN1\Element;
use Sop\ASN1\Type\UnspecifiedType;

/**
 * Implements explicit tagging mode.
 *
 * Explicit tagging wraps a type by prepending a tag. Underlying DER encoding
 * is not changed.
 */
class ExplicitlyTaggedType extends TaggedTypeWrap implements ExplicitTagging
{
    /**
     * Constructor.
     *
     * @param int     $tag     Tag number
     * @param Element $element Wrapped element
     * @param int     $class   Type class
     */
    public function __construct(int $tag, Element $element,
        int $class = Identifier::CLASS_CONTEXT_SPECIFIC)
    {
        $this->_typeTag = $tag;
        $this->_element = $element;
        $this->_class = $class;
    }

    /**
     * {@inheritdoc}
     */
    public function isConstructed(): bool
    {
        return true;
    }

    /**
     * {@inheritdoc}
     */
    public function explicit(): UnspecifiedType
    {
        return $this->_element->asUnspecified();
    }

    /**
     * {@inheritdoc}
     */
    protected function _encodedContentDER(): string
    {
        // get the full encoding of the wrapped element
        return $this->_element->toDER();
    }
}
