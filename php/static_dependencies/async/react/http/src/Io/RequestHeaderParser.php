<?php

namespace React\Http\Io;

use Evenement\EventEmitter;
use Psr\Http\Message\ServerRequestInterface;
use React\Http\Message\ServerRequest;
use React\Socket\ConnectionInterface;
use Exception;

/**
 * [Internal] Parses an incoming request header from an input stream
 *
 * This is used internally to parse the request header from the connection and
 * then process the remaining connection as the request body.
 *
 * @event headers
 * @event error
 *
 * @internal
 */
class RequestHeaderParser extends EventEmitter
{
    private $maxSize = 8192;

    public function handle(ConnectionInterface $conn)
    {
        $buffer = '';
        $maxSize = $this->maxSize;
        $that = $this;
        $conn->on('data', $fn = function ($data) use (&$buffer, &$fn, $conn, $maxSize, $that) {
            // append chunk of data to buffer and look for end of request headers
            $buffer .= $data;
            $endOfHeader = \strpos($buffer, "\r\n\r\n");

            // reject request if buffer size is exceeded
            if ($endOfHeader > $maxSize || ($endOfHeader === false && isset($buffer[$maxSize]))) {
                $conn->removeListener('data', $fn);
                $fn = null;

                $that->emit('error', array(
                    new \OverflowException("Maximum header size of {$maxSize} exceeded.", 431),
                    $conn
                ));
                return;
            }

            // ignore incomplete requests
            if ($endOfHeader === false) {
                return;
            }

            // request headers received => try to parse request
            $conn->removeListener('data', $fn);
            $fn = null;

            try {
                $request = $that->parseRequest(
                    (string)\substr($buffer, 0, $endOfHeader + 2),
                    $conn->getRemoteAddress(),
                    $conn->getLocalAddress()
                );
            } catch (Exception $exception) {
                $buffer = '';
                $that->emit('error', array(
                    $exception,
                    $conn
                ));
                return;
            }

            $contentLength = 0;
            if ($request->hasHeader('Transfer-Encoding')) {
                $contentLength = null;
            } elseif ($request->hasHeader('Content-Length')) {
                $contentLength = (int)$request->getHeaderLine('Content-Length');
            }

            if ($contentLength === 0) {
                // happy path: request body is known to be empty
                $stream = new EmptyBodyStream();
                $request = $request->withBody($stream);
            } else {
                // otherwise body is present => delimit using Content-Length or ChunkedDecoder
                $stream = new CloseProtectionStream($conn);
                if ($contentLength !== null) {
                    $stream = new LengthLimitedStream($stream, $contentLength);
                } else {
                    $stream = new ChunkedDecoder($stream);
                }

                $request = $request->withBody(new HttpBodyStream($stream, $contentLength));
            }

            $bodyBuffer = isset($buffer[$endOfHeader + 4]) ? \substr($buffer, $endOfHeader + 4) : '';
            $buffer = '';
            $that->emit('headers', array($request, $conn));

            if ($bodyBuffer !== '') {
                $conn->emit('data', array($bodyBuffer));
            }

            // happy path: request body is known to be empty => immediately end stream
            if ($contentLength === 0) {
                $stream->emit('end');
                $stream->close();
            }
        });

        $conn->on('close', function () use (&$buffer, &$fn) {
            $fn = $buffer = null;
        });
    }

    /**
     * @param string $headers buffer string containing request headers only
     * @param ?string $remoteSocketUri
     * @param ?string $localSocketUri
     * @return ServerRequestInterface
     * @throws \InvalidArgumentException
     * @internal
     */
    public function parseRequest($headers, $remoteSocketUri, $localSocketUri)
    {
        // additional, stricter safe-guard for request line
        // because request parser doesn't properly cope with invalid ones
        $start = array();
        if (!\preg_match('#^(?<method>[^ ]+) (?<target>[^ ]+) HTTP/(?<version>\d\.\d)#m', $headers, $start)) {
            throw new \InvalidArgumentException('Unable to parse invalid request-line');
        }

        // only support HTTP/1.1 and HTTP/1.0 requests
        if ($start['version'] !== '1.1' && $start['version'] !== '1.0') {
            throw new \InvalidArgumentException('Received request with invalid protocol version', 505);
        }

        // match all request header fields into array, thanks to @kelunik for checking the HTTP specs and coming up with this regex
        $matches = array();
        $n = \preg_match_all('/^([^()<>@,;:\\\"\/\[\]?={}\x01-\x20\x7F]++):[\x20\x09]*+((?:[\x20\x09]*+[\x21-\x7E\x80-\xFF]++)*+)[\x20\x09]*+[\r]?+\n/m', $headers, $matches, \PREG_SET_ORDER);

        // check number of valid header fields matches number of lines + request line
        if (\substr_count($headers, "\n") !== $n + 1) {
            throw new \InvalidArgumentException('Unable to parse invalid request header fields');
        }

        // format all header fields into associative array
        $host = null;
        $fields = array();
        foreach ($matches as $match) {
            $fields[$match[1]][] = $match[2];

            // match `Host` request header
            if ($host === null && \strtolower($match[1]) === 'host') {
                $host = $match[2];
            }
        }

        // create new obj implementing ServerRequestInterface by preserving all
        // previous properties and restoring original request-target
        $serverParams = array(
            'REQUEST_TIME' => \time(),
            'REQUEST_TIME_FLOAT' => \microtime(true)
        );

        // scheme is `http` unless TLS is used
        $localParts = \parse_url($localSocketUri);
        if (isset($localParts['scheme']) && $localParts['scheme'] === 'tls') {
            $scheme = 'https://';
            $serverParams['HTTPS'] = 'on';
        } else {
            $scheme = 'http://';
        }

        // default host if unset comes from local socket address or defaults to localhost
        if ($host === null) {
            $host = isset($localParts['host'], $localParts['port']) ? $localParts['host'] . ':' . $localParts['port'] : '127.0.0.1';
        }

        if ($start['method'] === 'OPTIONS' && $start['target'] === '*') {
            // support asterisk-form for `OPTIONS *` request line only
            $uri = $scheme . $host;
        } elseif ($start['method'] === 'CONNECT') {
            $parts = \parse_url('tcp://' . $start['target']);

            // check this is a valid authority-form request-target (host:port)
            if (!isset($parts['scheme'], $parts['host'], $parts['port']) || \count($parts) !== 3) {
                throw new \InvalidArgumentException('CONNECT method MUST use authority-form request target');
            }
            $uri = $scheme . $start['target'];
        } else {
            // support absolute-form or origin-form for proxy requests
            if ($start['target'][0] === '/') {
                $uri = $scheme . $host . $start['target'];
            } else {
                // ensure absolute-form request-target contains a valid URI
                $parts = \parse_url($start['target']);

                // make sure value contains valid host component (IP or hostname), but no fragment
                if (!isset($parts['scheme'], $parts['host']) || $parts['scheme'] !== 'http' || isset($parts['fragment'])) {
                    throw new \InvalidArgumentException('Invalid absolute-form request-target');
                }

                $uri = $start['target'];
            }
        }

        // apply REMOTE_ADDR and REMOTE_PORT if source address is known
        // address should always be known, unless this is over Unix domain sockets (UDS)
        if ($remoteSocketUri !== null) {
            $remoteAddress = \parse_url($remoteSocketUri);
            $serverParams['REMOTE_ADDR'] = $remoteAddress['host'];
            $serverParams['REMOTE_PORT'] = $remoteAddress['port'];
        }

        // apply SERVER_ADDR and SERVER_PORT if server address is known
        // address should always be known, even for Unix domain sockets (UDS)
        // but skip UDS as it doesn't have a concept of host/port.
        if ($localSocketUri !== null && isset($localParts['host'], $localParts['port'])) {
            $serverParams['SERVER_ADDR'] = $localParts['host'];
            $serverParams['SERVER_PORT'] = $localParts['port'];
        }

        $request = new ServerRequest(
            $start['method'],
            $uri,
            $fields,
            '',
            $start['version'],
            $serverParams
        );

        // only assign request target if it is not in origin-form (happy path for most normal requests)
        if ($start['target'][0] !== '/') {
            $request = $request->withRequestTarget($start['target']);
        }

        // Optional Host header value MUST be valid (host and optional port)
        if ($request->hasHeader('Host')) {
            $parts = \parse_url('http://' . $request->getHeaderLine('Host'));

            // make sure value contains valid host component (IP or hostname)
            if (!$parts || !isset($parts['scheme'], $parts['host'])) {
                $parts = false;
            }

            // make sure value does not contain any other URI component
            unset($parts['scheme'], $parts['host'], $parts['port']);
            if ($parts === false || $parts) {
                throw new \InvalidArgumentException('Invalid Host header value');
            }
        }

        // ensure message boundaries are valid according to Content-Length and Transfer-Encoding request headers
        if ($request->hasHeader('Transfer-Encoding')) {
            if (\strtolower($request->getHeaderLine('Transfer-Encoding')) !== 'chunked') {
                throw new \InvalidArgumentException('Only chunked-encoding is allowed for Transfer-Encoding', 501);
            }

            // Transfer-Encoding: chunked and Content-Length header MUST NOT be used at the same time
            // as per https://tools.ietf.org/html/rfc7230#section-3.3.3
            if ($request->hasHeader('Content-Length')) {
                throw new \InvalidArgumentException('Using both `Transfer-Encoding: chunked` and `Content-Length` is not allowed', 400);
            }
        } elseif ($request->hasHeader('Content-Length')) {
            $string = $request->getHeaderLine('Content-Length');

            if ((string)(int)$string !== $string) {
                // Content-Length value is not an integer or not a single integer
                throw new \InvalidArgumentException('The value of `Content-Length` is not valid', 400);
            }
        }

        // always sanitize Host header because it contains critical routing information
        $request = $request->withUri($request->getUri()->withUserInfo('u')->withUserInfo(''));

        return $request;
    }
}
