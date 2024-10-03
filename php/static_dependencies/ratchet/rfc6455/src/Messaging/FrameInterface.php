<?php
namespace Ratchet\RFC6455\Messaging;

interface FrameInterface extends DataInterface {
    /**
     * Add incoming data to the frame from peer
     * @param string
     */
    function addBuffer($buf);

    /**
     * Is this the final frame in a fragmented message?
     * @return bool
     */
    function isFinal();

    /**
     * Is the payload masked?
     * @return bool
     */
    function isMasked();

    /**
     * @return int
     */
    function getOpcode();

    /**
     * @return int
     */
    //function getReceivedPayloadLength();

    /**
     * 32-big string
     * @return string
     */
    function getMaskingKey();
}
