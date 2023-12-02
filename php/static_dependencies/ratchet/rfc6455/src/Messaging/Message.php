<?php
namespace Ratchet\RFC6455\Messaging;

class Message implements \IteratorAggregate, MessageInterface {
    /**
     * @var \SplDoublyLinkedList
     */
    private $_frames;

    /**
     * @var int
     */
    private $len;

    #[\ReturnTypeWillChange]
    public function __construct() {
        $this->_frames = new \SplDoublyLinkedList;
        $this->len = 0;
    }

    #[\ReturnTypeWillChange]
    public function getIterator() {
        return $this->_frames;
    }

    /**
     * {@inheritdoc}
     */
    #[\ReturnTypeWillChange]
    public function count() {
        return count($this->_frames);
    }

    /**
     * {@inheritdoc}
     */
    #[\ReturnTypeWillChange]
    public function isCoalesced() {
        if (count($this->_frames) == 0) {
            return false;
        }

        $last = $this->_frames->top();

        return ($last->isCoalesced() && $last->isFinal());
    }

    /**
     * {@inheritdoc}
     */
    public function addFrame(FrameInterface $fragment) {
        $this->len += $fragment->getPayloadLength();
        $this->_frames->push($fragment);

        return $this;
    }

    /**
     * {@inheritdoc}
     */
    public function getOpcode() {
        if (count($this->_frames) == 0) {
            throw new \UnderflowException('No frames have been added to this message');
        }

        return $this->_frames->bottom()->getOpcode();
    }

    /**
     * {@inheritdoc}
     */
    public function getPayloadLength() {
        return $this->len;
    }

    /**
     * {@inheritdoc}
     */
    public function getPayload() {
        if (!$this->isCoalesced()) {
            throw new \UnderflowException('Message has not been put back together yet');
        }

        return $this->__toString();
    }

    /**
     * {@inheritdoc}
     */
    public function getContents() {
        if (!$this->isCoalesced()) {
            throw new \UnderflowException("Message has not been put back together yet");
        }

        $buffer = '';

        foreach ($this->_frames as $frame) {
            $buffer .= $frame->getContents();
        }

        return $buffer;
    }

    public function __toString() {
        $buffer = '';

        foreach ($this->_frames as $frame) {
            $buffer .= $frame->getPayload();
        }

        return $buffer;
    }

    /**
     * @return boolean
     */
    public function isBinary() {
        if ($this->_frames->isEmpty()) {
            throw new \UnderflowException('Not enough data has been received to determine if message is binary');
        }

        return Frame::OP_BINARY === $this->_frames->bottom()->getOpcode();
    }

    /**
     * @return boolean
     */
    public function getRsv1() {
        if ($this->_frames->isEmpty()) {
            return false;
            //throw new \UnderflowException('Not enough data has been received to determine if message is binary');
        }

        return $this->_frames->bottom()->getRsv1();
    }
}
