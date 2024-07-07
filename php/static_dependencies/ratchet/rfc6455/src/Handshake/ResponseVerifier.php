<?php
namespace Ratchet\RFC6455\Handshake;
use Psr\Http\Message\RequestInterface;
use Psr\Http\Message\ResponseInterface;

class ResponseVerifier {
    public function verifyAll(RequestInterface $request, ResponseInterface $response) {
        $passes = 0;

        $passes += (int)$this->verifyStatus($response->getStatusCode());
        $passes += (int)$this->verifyUpgrade($response->getHeader('Upgrade'));
        $passes += (int)$this->verifyConnection($response->getHeader('Connection'));
        $passes += (int)$this->verifySecWebSocketAccept(
            $response->getHeader('Sec-WebSocket-Accept')
          , $request->getHeader('Sec-WebSocket-Key')
        );
        $passes += (int)$this->verifySubProtocol(
            $request->getHeader('Sec-WebSocket-Protocol')
          , $response->getHeader('Sec-WebSocket-Protocol')
        );
        $passes += (int)$this->verifyExtensions(
            $request->getHeader('Sec-WebSocket-Extensions')
            , $response->getHeader('Sec-WebSocket-Extensions')
        );

        return (6 === $passes);
    }

    public function verifyStatus($status) {
        return ((int)$status === 101);
    }

    public function verifyUpgrade(array $upgrade) {
        return (in_array('websocket', array_map('strtolower', $upgrade)));
    }

    public function verifyConnection(array $connection) {
        return (in_array('upgrade', array_map('strtolower', $connection)));
    }

    public function verifySecWebSocketAccept($swa, $key) {
        return (
            1 === count($swa) &&
            1 === count($key) &&
            $swa[0] === $this->sign($key[0])
        );
    }

    public function sign($key) {
        return base64_encode(sha1($key . NegotiatorInterface::GUID, true));
    }

    public function verifySubProtocol(array $requestHeader, array $responseHeader) {
        if (0 === count($responseHeader)) {
            return true;
        }

        $requestedProtocols = array_map('trim', explode(',', implode(',', $requestHeader)));

        return count($responseHeader) === 1 && count(array_intersect($responseHeader, $requestedProtocols)) === 1;
    }

    public function verifyExtensions(array $requestHeader, array $responseHeader) {
        if (in_array('permessage-deflate', $responseHeader)) {
            return strpos(implode(',', $requestHeader), 'permessage-deflate') !== false ? 1 : 0;
        }

        return 1;
    }
}
