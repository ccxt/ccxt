<?php
namespace Ratchet\RFC6455\Handshake;
use Psr\Http\Message\RequestInterface;

/**
 * These are checks to ensure the client requested handshake are valid
 * Verification rules come from section 4.2.1 of the RFC6455 document
 * @todo Currently just returning invalid - should consider returning appropriate HTTP status code error #s
 */
class RequestVerifier {
    const VERSION = 13;

    /**
     * Given an array of the headers this method will run through all verification methods
     * @param RequestInterface $request
     * @return bool TRUE if all headers are valid, FALSE if 1 or more were invalid
     */
    public function verifyAll(RequestInterface $request) {
        $passes = 0;

        $passes += (int)$this->verifyMethod($request->getMethod());
        $passes += (int)$this->verifyHTTPVersion($request->getProtocolVersion());
        $passes += (int)$this->verifyRequestURI($request->getUri()->getPath());
        $passes += (int)$this->verifyHost($request->getHeader('Host'));
        $passes += (int)$this->verifyUpgradeRequest($request->getHeader('Upgrade'));
        $passes += (int)$this->verifyConnection($request->getHeader('Connection'));
        $passes += (int)$this->verifyKey($request->getHeader('Sec-WebSocket-Key'));
        $passes += (int)$this->verifyVersion($request->getHeader('Sec-WebSocket-Version'));

        return (8 === $passes);
    }

    /**
     * Test the HTTP method.  MUST be "GET"
     * @param string
     * @return bool
     */
    public function verifyMethod($val) {
        return ('get' === strtolower($val));
    }

    /**
     * Test the HTTP version passed.  MUST be 1.1 or greater
     * @param string|int
     * @return bool
     */
    public function verifyHTTPVersion($val) {
        return (1.1 <= (double)$val);
    }

    /**
     * @param string
     * @return bool
     */
    public function verifyRequestURI($val) {
        if ($val[0] !== '/') {
            return false;
        }

        if (false !== strstr($val, '#')) {
            return false;
        }

        if (!extension_loaded('mbstring')) {
            return true;
        }

        return mb_check_encoding($val, 'US-ASCII');
    }

    /**
     * @param array $hostHeader
     * @return bool
     * @todo Once I fix HTTP::getHeaders just verify this isn't NULL or empty...or maybe need to verify it's a valid domain??? Or should it equal $_SERVER['HOST'] ?
     */
    public function verifyHost(array $hostHeader) {
        return (1 === count($hostHeader));
    }

    /**
     * Verify the Upgrade request to WebSockets.
     * @param  array $upgradeHeader MUST equal "websocket"
     * @return bool
     */
    public function verifyUpgradeRequest(array $upgradeHeader) {
        return (1 === count($upgradeHeader) && 'websocket' === strtolower($upgradeHeader[0]));
    }

    /**
     * Verify the Connection header
     * @param  array $connectionHeader MUST include "Upgrade"
     * @return bool
     */
    public function verifyConnection(array $connectionHeader) {
        foreach ($connectionHeader as $l) {
            $upgrades = array_filter(
                array_map('trim', array_map('strtolower', explode(',', $l))),
                function ($x) {
                    return 'upgrade' === $x;
                }
            );
            if (count($upgrades) > 0) {
                return true;
            }
        }
        return false;
    }

    /**
     * This function verifies the nonce is valid (64 big encoded, 16 bytes random string)
     * @param array $keyHeader
     * @return bool
     * @todo The spec says we don't need to base64_decode - can I just check if the length is 24 and not decode?
     * @todo Check the spec to see what the encoding of the key could be
     */
    public function verifyKey(array $keyHeader) {
        return (1 === count($keyHeader) && 16 === strlen(base64_decode($keyHeader[0])));
    }

    /**
     * Verify the version passed matches this RFC
     * @param string[] $versionHeader MUST equal ["13"]
     * @return bool
     */
    public function verifyVersion(array $versionHeader) {
        return (1 === count($versionHeader) && static::VERSION === (int)$versionHeader[0]);
    }

    /**
     * @todo Write logic for this method.  See section 4.2.1.8
     */
    public function verifyProtocol($val) {
    }

    /**
     * @todo Write logic for this method.  See section 4.2.1.9
     */
    public function verifyExtensions($val) {
    }

    public function getPermessageDeflateOptions(array $requestHeader, array $responseHeader) {
        $deflate = true;
        if (!isset($requestHeader['Sec-WebSocket-Extensions']) || count(array_filter($requestHeader['Sec-WebSocket-Extensions'], function ($val) {
            return 'permessage-deflate' === substr($val, 0, strlen('permessage-deflate'));
        })) === 0) {
             $deflate = false;
        }

        if (!isset($responseHeader['Sec-WebSocket-Extensions']) || count(array_filter($responseHeader['Sec-WebSocket-Extensions'], function ($val) {
                return 'permessage-deflate' === substr($val, 0, strlen('permessage-deflate'));
            })) === 0) {
            $deflate = false;
        }

        return [
            'deflate' => $deflate,
            'no_context_takeover' => false,
            'max_window_bits' => null,
            'request_no_context_takeover' => false,
            'request_max_window_bits' => null
        ];
    }
}
