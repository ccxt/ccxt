<?php

declare(strict_types = 1);

namespace Sop\ASN1\Type;

use Sop\ASN1\Component\Identifier;
use Sop\ASN1\Component\Length;
use Sop\ASN1\Element;
use Sop\ASN1\Exception\DecodeException;
use Sop\ASN1\Feature\ElementBase;

/**
 * Base class for the constructed types.
 */
abstract class Structure extends Element implements \Countable, \IteratorAggregate
{
    use UniversalClass;

    /**
     * Array of elements in the structure.
     *
     * @var Element[]
     */
    protected $_elements;

    /**
     * Lookup table for the tagged elements.
     *
     * @var null|TaggedType[]
     */
    private $_taggedMap;

    /**
     * Cache variable of elements wrapped into `UnspecifiedType` objects.
     *
     * @var null|UnspecifiedType[]
     */
    private $_unspecifiedTypes;

    /**
     * Constructor.
     *
     * @param ElementBase ...$elements Any number of elements
     */
    public function __construct(ElementBase ...$elements)
    {
        $this->_elements = array_map(
            function (ElementBase $el) {
                return $el->asElement();
            }, $elements);
    }

    /**
     * Clone magic method.
     */
    public function __clone()
    {
        // clear cache-variables
        $this->_taggedMap = null;
        $this->_unspecifiedTypes = null;
    }

    /**
     * {@inheritdoc}
     */
    public function isConstructed(): bool
    {
        return true;
    }

    /**
     * Explode DER structure to DER encoded components that it contains.
     *
     * @throws DecodeException
     *
     * @return string[]
     */
    public static function explodeDER(string $data): array
    {
        $offset = 0;
        $identifier = Identifier::fromDER($data, $offset);
        if (!$identifier->isConstructed()) {
            throw new DecodeException('Element is not constructed.');
        }
        $length = Length::expectFromDER($data, $offset);
        if ($length->isIndefinite()) {
            throw new DecodeException(
                'Explode not implemented for indefinite length encoding.');
        }
        $end = $offset + $length->intLength();
        $parts = [];
        while ($offset < $end) {
            // start of the element
            $idx = $offset;
            // skip identifier
            Identifier::fromDER($data, $offset);
            // decode element length
            $length = Length::expectFromDER($data, $offset)->intLength();
            // extract der encoding of the element
            $parts[] = substr($data, $idx, $offset - $idx + $length);
            // update offset over content
            $offset += $length;
        }
        return $parts;
    }

    /**
     * Get self with an element at the given index replaced by another.
     *
     * @param int     $idx Element index
     * @param Element $el  New element to insert into the structure
     *
     * @throws \OutOfBoundsException
     */
    public function withReplaced(int $idx, Element $el): self
    {
        if (!isset($this->_elements[$idx])) {
            throw new \OutOfBoundsException(
                "Structure doesn't have element at index {$idx}.");
        }
        $obj = clone $this;
        $obj->_elements[$idx] = $el;
        return $obj;
    }

    /**
     * Get self with an element inserted before the given index.
     *
     * @param int     $idx Element index
     * @param Element $el  New element to insert into the structure
     *
     * @throws \OutOfBoundsException
     */
    public function withInserted(int $idx, Element $el): self
    {
        if (count($this->_elements) < $idx || $idx < 0) {
            throw new \OutOfBoundsException("Index {$idx} is out of bounds.");
        }
        $obj = clone $this;
        array_splice($obj->_elements, $idx, 0, [$el]);
        return $obj;
    }

    /**
     * Get self with an element appended to the end.
     *
     * @param Element $el Element to insert into the structure
     */
    public function withAppended(Element $el): self
    {
        $obj = clone $this;
        array_push($obj->_elements, $el);
        return $obj;
    }

    /**
     * Get self with an element prepended in the beginning.
     *
     * @param Element $el Element to insert into the structure
     */
    public function withPrepended(Element $el): self
    {
        $obj = clone $this;
        array_unshift($obj->_elements, $el);
        return $obj;
    }

    /**
     * Get self with an element at the given index removed.
     *
     * @param int $idx Element index
     *
     * @throws \OutOfBoundsException
     */
    public function withoutElement(int $idx): self
    {
        if (!isset($this->_elements[$idx])) {
            throw new \OutOfBoundsException(
                "Structure doesn't have element at index {$idx}.");
        }
        $obj = clone $this;
        array_splice($obj->_elements, $idx, 1);
        return $obj;
    }

    /**
     * Get elements in the structure.
     *
     * @return UnspecifiedType[]
     */
    public function elements(): array
    {
        if (!isset($this->_unspecifiedTypes)) {
            $this->_unspecifiedTypes = array_map(
                function (Element $el) {
                    return new UnspecifiedType($el);
                }, $this->_elements);
        }
        return $this->_unspecifiedTypes;
    }

    /**
     * Check whether the structure has an element at the given index, optionally
     * satisfying given tag expectation.
     *
     * @param int      $idx         Index 0..n
     * @param null|int $expectedTag Optional type tag expectation
     */
    public function has(int $idx, ?int $expectedTag = null): bool
    {
        if (!isset($this->_elements[$idx])) {
            return false;
        }
        if (isset($expectedTag)) {
            if (!$this->_elements[$idx]->isType($expectedTag)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Get the element at the given index, optionally checking that the element
     * has a given tag.
     *
     * @param int $idx Index 0..n
     *
     * @throws \OutOfBoundsException     If element doesn't exists
     * @throws \UnexpectedValueException If expectation fails
     */
    public function at(int $idx): UnspecifiedType
    {
        if (!isset($this->_elements[$idx])) {
            throw new \OutOfBoundsException(
                "Structure doesn't have an element at index {$idx}.");
        }
        return new UnspecifiedType($this->_elements[$idx]);
    }

    /**
     * Check whether the structure contains a context specific element with a
     * given tag.
     *
     * @param int $tag Tag number
     */
    public function hasTagged(int $tag): bool
    {
        // lazily build lookup map
        if (!isset($this->_taggedMap)) {
            $this->_taggedMap = [];
            foreach ($this->_elements as $element) {
                if ($element->isTagged()) {
                    $this->_taggedMap[$element->tag()] = $element;
                }
            }
        }
        return isset($this->_taggedMap[$tag]);
    }

    /**
     * Get a context specific element tagged with a given tag.
     *
     * @throws \LogicException If tag doesn't exists
     */
    public function getTagged(int $tag): TaggedType
    {
        if (!$this->hasTagged($tag)) {
            throw new \LogicException("No tagged element for tag {$tag}.");
        }
        return $this->_taggedMap[$tag];
    }

    /**
     * @see \Countable::count()
     */
    public function count(): int
    {
        return count($this->_elements);
    }

    /**
     * Get an iterator for the `UnspecifiedElement` objects.
     *
     * @see \IteratorAggregate::getIterator()
     */
    public function getIterator(): \ArrayIterator
    {
        return new \ArrayIterator($this->elements());
    }

    /**
     * {@inheritdoc}
     */
    protected function _encodedContentDER(): string
    {
        $data = '';
        foreach ($this->_elements as $element) {
            $data .= $element->toDER();
        }
        return $data;
    }

    /**
     * {@inheritdoc}
     *
     * @return self
     */
    protected static function _decodeFromDER(Identifier $identifier,
        string $data, int &$offset): ElementBase
    {
        if (!$identifier->isConstructed()) {
            throw new DecodeException(
                'Structured element must have constructed bit set.');
        }
        $idx = $offset;
        $length = Length::expectFromDER($data, $idx);
        if ($length->isIndefinite()) {
            $type = self::_decodeIndefiniteLength($data, $idx);
        } else {
            $type = self::_decodeDefiniteLength($data, $idx,
                $length->intLength());
        }
        $offset = $idx;
        return $type;
    }

    /**
     * Decode elements for a definite length.
     *
     * @param string $data   DER data
     * @param int    $offset Offset to data
     * @param int    $length Number of bytes to decode
     *
     * @throws DecodeException
     */
    private static function _decodeDefiniteLength(string $data, int &$offset,
        int $length): ElementBase
    {
        $idx = $offset;
        $end = $idx + $length;
        $elements = [];
        while ($idx < $end) {
            $elements[] = Element::fromDER($data, $idx);
            // check that element didn't overflow length
            if ($idx > $end) {
                throw new DecodeException("Structure's content overflows length.");
            }
        }
        $offset = $idx;
        // return instance by static late binding
        return new static(...$elements);
    }

    /**
     * Decode elements for an indefinite length.
     *
     * @param string $data   DER data
     * @param int    $offset Offset to data
     *
     * @throws DecodeException
     */
    private static function _decodeIndefiniteLength(string $data, int &$offset): ElementBase
    {
        $idx = $offset;
        $elements = [];
        $end = strlen($data);
        while (true) {
            if ($idx >= $end) {
                throw new DecodeException(
                    'Unexpected end of data while decoding indefinite length structure.');
            }
            $el = Element::fromDER($data, $idx);
            if ($el->isType(self::TYPE_EOC)) {
                break;
            }
            $elements[] = $el;
        }
        $offset = $idx;
        $type = new static(...$elements);
        $type->_indefiniteLength = true;
        return $type;
    }
}
