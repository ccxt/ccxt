<?php
namespace Ratchet\RFC6455\Messaging;

interface MessageInterface extends DataInterface, \Traversable, \Countable {
    /**
     * @param FrameInterface $fragment
     * @return MessageInterface
     */
    function addFrame(FrameInterface $fragment);

    /**
     * @return int
     */
    function getOpcode();

    /**
     * @return bool
     */
    function isBinary();
}
