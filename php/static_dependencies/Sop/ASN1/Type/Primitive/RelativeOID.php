<?php

declare(strict_types = 1);

namespace Sop\ASN1\Type\Primitive;

use Sop\ASN1\Component\Identifier;
use Sop\ASN1\Component\Length;
use Sop\ASN1\Feature\ElementBase;

/**
 * Implements *RELATIVE-OID* type.
 */
class RelativeOID extends ObjectIdentifier
{
    /**
     * Constructor.
     *
     * @param string $oid OID in dotted format
     */
    public function __construct(string $oid)
    {
        $this->_oid = $oid;
        $this->_subids = self::_explodeDottedOID($oid);
        $this->_typeTag = self::TYPE_RELATIVE_OID;
    }

    /**
     * {@inheritdoc}
     */
    protected function _encodedContentDER(): string
    {
        return self::_encodeSubIDs(...$this->_subids);
    }

    /**
     * {@inheritdoc}
     */
    protected static function _decodeFromDER(Identifier $identifier,
        string $data, int &$offset): ElementBase
    {
        $idx = $offset;
        $len = Length::expectFromDER($data, $idx)->intLength();
        $subids = self::_decodeSubIDs(substr($data, $idx, $len));
        $offset = $idx + $len;
        return new self(self::_implodeSubIDs(...$subids));
    }
}
