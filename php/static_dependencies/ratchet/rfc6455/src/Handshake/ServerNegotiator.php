<?php
namespace Ratchet\RFC6455\Handshake;
use Psr\Http\Message\RequestInterface;
use GuzzleHttp\Psr7\Response;

/**
 * The latest version of the WebSocket protocol
 * @todo Unicode: return mb_convert_encoding(pack("N",$u), mb_internal_encoding(), 'UCS-4BE');
 */
class ServerNegotiator implements NegotiatorInterface {
    /**
     * @var \Ratchet\RFC6455\Handshake\RequestVerifier
     */
    private $verifier;

    private $_supportedSubProtocols = [];

    private $_strictSubProtocols = false;

    private $enablePerMessageDeflate = false;

    public function __construct(RequestVerifier $requestVerifier, $enablePerMessageDeflate = false) {
        $this->verifier = $requestVerifier;

        // https://bugs.php.net/bug.php?id=73373
        // https://bugs.php.net/bug.php?id=74240 - need >=7.1.4 or >=7.0.18
        $supported = PermessageDeflateOptions::permessageDeflateSupported();
        if ($enablePerMessageDeflate && !$supported) {
            throw new \Exception('permessage-deflate is not supported by your PHP version (need >=7.1.4 or >=7.0.18).');
        }
        if ($enablePerMessageDeflate && !function_exists('deflate_add')) {
            throw new \Exception('permessage-deflate is not supported because you do not have the zlib extension.');
        }

        $this->enablePerMessageDeflate = $enablePerMessageDeflate;
    }

    /**
     * {@inheritdoc}
     */
    public function isProtocol(RequestInterface $request) {
        return $this->verifier->verifyVersion($request->getHeader('Sec-WebSocket-Version'));
    }

    /**
     * {@inheritdoc}
     */
    public function getVersionNumber() {
        return RequestVerifier::VERSION;
    }

    /**
     * {@inheritdoc}
     */
    public function handshake(RequestInterface $request) {
        if (true !== $this->verifier->verifyMethod($request->getMethod())) {
            return new Response(405, ['Allow' => 'GET']);
        }

        if (true !== $this->verifier->verifyHTTPVersion($request->getProtocolVersion())) {
            return new Response(505);
        }

        if (true !== $this->verifier->verifyRequestURI($request->getUri()->getPath())) {
            return new Response(400);
        }

        if (true !== $this->verifier->verifyHost($request->getHeader('Host'))) {
            return new Response(400);
        }

        $upgradeSuggestion = [
            'Connection'             => 'Upgrade',
            'Upgrade'                => 'websocket',
            'Sec-WebSocket-Version'  => $this->getVersionNumber()
        ];
        if (count($this->_supportedSubProtocols) > 0) {
            $upgradeSuggestion['Sec-WebSocket-Protocol'] = implode(', ', array_keys($this->_supportedSubProtocols));
        }
        if (true !== $this->verifier->verifyUpgradeRequest($request->getHeader('Upgrade'))) {
            return new Response(426, $upgradeSuggestion, null, '1.1', 'Upgrade header MUST be provided');
        }

        if (true !== $this->verifier->verifyConnection($request->getHeader('Connection'))) {
            return new Response(400, [], null, '1.1', 'Connection Upgrade MUST be requested');
        }

        if (true !== $this->verifier->verifyKey($request->getHeader('Sec-WebSocket-Key'))) {
            return new Response(400, [], null, '1.1', 'Invalid Sec-WebSocket-Key');
        }

        if (true !== $this->verifier->verifyVersion($request->getHeader('Sec-WebSocket-Version'))) {
            return new Response(426, $upgradeSuggestion);
        }

        $headers = [];
        $subProtocols = $request->getHeader('Sec-WebSocket-Protocol');
        if (count($subProtocols) > 0 || (count($this->_supportedSubProtocols) > 0 && $this->_strictSubProtocols)) {
            $subProtocols = array_map('trim', explode(',', implode(',', $subProtocols)));

            $match = array_reduce($subProtocols, function($accumulator, $protocol) {
                return $accumulator ?: (isset($this->_supportedSubProtocols[$protocol]) ? $protocol : null);
            }, null);

            if ($this->_strictSubProtocols && null === $match) {
                return new Response(426, $upgradeSuggestion, null, '1.1', 'No Sec-WebSocket-Protocols requested supported');
            }

            if (null !== $match) {
                $headers['Sec-WebSocket-Protocol'] = $match;
            }
        }

        $response = new Response(101, array_merge($headers, [
            'Upgrade'              => 'websocket'
            , 'Connection'           => 'Upgrade'
            , 'Sec-WebSocket-Accept' => $this->sign((string)$request->getHeader('Sec-WebSocket-Key')[0])
            , 'X-Powered-By'         => 'Ratchet'
        ]));

        try {
            $perMessageDeflateRequest = PermessageDeflateOptions::fromRequestOrResponse($request)[0];
        } catch (InvalidPermessageDeflateOptionsException $e) {
            return new Response(400, [], null, '1.1', $e->getMessage());
        }

        if ($this->enablePerMessageDeflate && $perMessageDeflateRequest->isEnabled()) {
            $response = $perMessageDeflateRequest->addHeaderToResponse($response);
        }

        return $response;
    }

    /**
     * Used when doing the handshake to encode the key, verifying client/server are speaking the same language
     * @param  string $key
     * @return string
     * @internal
     */
    public function sign($key) {
        return base64_encode(sha1($key . static::GUID, true));
    }

    /**
     * @param array $protocols
     */
    function setSupportedSubProtocols(array $protocols) {
        $this->_supportedSubProtocols = array_flip($protocols);
    }

    /**
     * If enabled and support for a subprotocol has been added handshake
     *  will not upgrade if a match between request and supported subprotocols
     * @param boolean $enable
     * @todo Consider extending this interface and moving this there.
     *       The spec does says the server can fail for this reason, but
     * it is not a requirement. This is an implementation detail.
     */
    function setStrictSubProtocolCheck($enable) {
        $this->_strictSubProtocols = (boolean)$enable;
    }
}
