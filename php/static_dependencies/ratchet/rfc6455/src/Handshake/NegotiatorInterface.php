<?php
namespace Ratchet\RFC6455\Handshake;
use Psr\Http\Message\RequestInterface;

/**
 * A standard interface for interacting with the various version of the WebSocket protocol
 * @todo Look in to extension support
 */
interface NegotiatorInterface {
    const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

    /**
     * Given an HTTP header, determine if this version should handle the protocol
     * @param RequestInterface $request
     * @return bool
     */
    function isProtocol(RequestInterface $request);

    /**
     * Although the version has a name associated with it the integer returned is the proper identification
     * @return int
     */
    function getVersionNumber();

    /**
     * Perform the handshake and return the response headers
     * @param RequestInterface $request
     * @return \Psr\Http\Message\ResponseInterface
     */
    function handshake(RequestInterface $request);

    /**
     * Add supported protocols. If the request has any matching the response will include one
     * @param array $protocols
     */
    function setSupportedSubProtocols(array $protocols);

    /**
     * If enabled and support for a subprotocol has been added handshake
     *  will not upgrade if a match between request and supported subprotocols
     * @param boolean $enable
     * @todo Consider extending this interface and moving this there.
     *       The spec does says the server can fail for this reason, but
     *       it is not a requirement. This is an implementation detail.
     */
    function setStrictSubProtocolCheck($enable);
}
