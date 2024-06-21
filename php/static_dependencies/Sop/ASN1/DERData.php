<?php

declare(strict_types = 1);

namespace Sop\ASN1;

use Sop\ASN1\Component\Identifier;
use Sop\ASN1\Component\Length;

/**
 * Container for raw DER encoded data.
 *
 * May be inserted into structure without decoding first.
 */
class DERData extends Element
{
    /**
     * DER encoded data.
     *
     * @var string
     */
    protected $_der;

    /**
     * Identifier of the underlying type.
     *
     * @var Identifier
     */
    protected $_identifier;

    /**
     * Offset to the content in DER data.
     *
     * @var int
     */
    protected $_contentOffset = 0;

    /**
     * Constructor.
     *
     * @param string $data DER encoded data
     *
     * @throws \Sop\ASN1\Exception\DecodeException If data does not adhere to DER
     */
    public function __construct(string $data)
    {
        $this->_identifier = Identifier::fromDER($data, $this->_contentOffset);
        // check that length encoding is valid
        Length::expectFromDER($data, $this->_contentOffset);
        $this->_der = $data;
        $this->_typeTag = $this->_identifier->intTag();
    }

    /**
     * {@inheritdoc}
     */
    public function typeClass(): int
    {
        return $this->_identifier->typeClass();
    }

    /**
     * {@inheritdoc}
     */
    public function isConstructed(): bool
    {
        return $this->_identifier->isConstructed();
    }

    /**
     * {@inheritdoc}
     */
    public function toDER(): string
    {
        return $this->_der;
    }

    /**
     * {@inheritdoc}
     */
    protected function _encodedContentDER(): string
    {
        // if there's no content payload
        if (strlen($this->_der) === $this->_contentOffset) {
            return '';
        }
        return substr($this->_der, $this->_contentOffset);
    }
}
