<?php

namespace Clue\React\HttpProxy;

require_once dirname(dirname(dirname(__DIR__))) . '/ringcentral-psr7/loader.php';

use Exception;
use InvalidArgumentException;
use RuntimeException;
use RingCentral\Psr7;
use React\Promise;
use React\Promise\Deferred;
use React\Socket\ConnectionInterface;
use React\Socket\Connector;
use React\Socket\ConnectorInterface;
use React\Socket\FixedUriConnector;
use React\Socket\UnixConnector;

/**
 * A simple Connector that uses an HTTP CONNECT proxy to create plain TCP/IP connections to any destination
 *
 * [you] -> [proxy] -> [destination]
 *
 * This is most frequently used to issue HTTPS requests to your destination.
 * However, this is actually performed on a higher protocol layer and this
 * connector is actually inherently a general-purpose plain TCP/IP connector.
 *
 * Note that HTTP CONNECT proxies often restrict which ports one may connect to.
 * Many (public) proxy servers do in fact limit this to HTTPS (443) only.
 *
 * If you want to establish a TLS connection (such as HTTPS) between you and
 * your destination, you may want to wrap this connector in a SecureConnector
 * instance.
 *
 * Note that communication between the client and the proxy is usually via an
 * unencrypted, plain TCP/IP HTTP connection. Note that this is the most common
 * setup, because you can still establish a TLS connection between you and the
 * destination host as above.
 *
 * If you want to connect to a (rather rare) HTTPS proxy, you may want use its
 * HTTPS port (443) and use a SecureConnector instance to create a secure
 * connection to the proxy.
 *
 * @link https://tools.ietf.org/html/rfc7231#section-4.3.6
 */
class ProxyConnector implements ConnectorInterface
{
    private $connector;
    private $proxyUri;
    private $headers = '';

    /**
     * Instantiate a new ProxyConnector which uses the given $proxyUrl
     *
     * @param string $proxyUrl The proxy URL may or may not contain a scheme and
     *     port definition. The default port will be `80` for HTTP (or `443` for
     *     HTTPS), but many common HTTP proxy servers use custom ports.
     * @param ?ConnectorInterface $connector (Optional) Connector to use.
     * @param array $httpHeaders Custom HTTP headers to be sent to the proxy.
     * @throws InvalidArgumentException if the proxy URL is invalid
     */
    public function __construct(
        #[\SensitiveParameter]
        $proxyUrl,
        $connector = null,
        array $httpHeaders = array()
    ) {
        // support `http+unix://` scheme for Unix domain socket (UDS) paths
        if (preg_match('/^http\+unix:\/\/(.*?@)?(.+?)$/', $proxyUrl, $match)) {
            // rewrite URI to parse authentication from dummy host
            $proxyUrl = 'http://' . $match[1] . 'localhost';

            // connector uses Unix transport scheme and explicit path given
            $connector = new FixedUriConnector(
                'unix://' . $match[2],
                $connector ?: new UnixConnector()
            );
        }

        if (strpos($proxyUrl, '://') === false) {
            $proxyUrl = 'http://' . $proxyUrl;
        }

        $parts = parse_url($proxyUrl);
        if (!$parts || !isset($parts['scheme'], $parts['host']) || ($parts['scheme'] !== 'http' && $parts['scheme'] !== 'https')) {
            throw new InvalidArgumentException('Invalid proxy URL "' . $proxyUrl . '"');
        }

        if ($connector !== null && !$connector instanceof ConnectorInterface) { // manual type check to support legacy PHP < 7.1
            throw new \InvalidArgumentException('Argument #2 ($connector) expected null|React\Socket\ConnectorInterface');
        }

        // apply default port and TCP/TLS transport for given scheme
        if (!isset($parts['port'])) {
            $parts['port'] = $parts['scheme'] === 'https' ? 443 : 80;
        }
        $parts['scheme'] = $parts['scheme'] === 'https' ? 'tls' : 'tcp';

        $this->connector = $connector ?: new Connector();
        $this->proxyUri = $parts['scheme'] . '://' . $parts['host'] . ':' . $parts['port'];

        // prepare Proxy-Authorization header if URI contains username/password
        if (isset($parts['user']) || isset($parts['pass'])) {
            $this->headers = 'Proxy-Authorization: Basic ' . base64_encode(
                rawurldecode($parts['user'] . ':' . (isset($parts['pass']) ? $parts['pass'] : ''))
            ) . "\r\n";
        }

        // append any additional custom request headers
        foreach ($httpHeaders as $name => $values) {
            foreach ((array)$values as $value) {
                $this->headers .= $name . ': ' . $value . "\r\n";
            }
        }
    }

    public function connect($uri)
    {
        if (strpos($uri, '://') === false) {
            $uri = 'tcp://' . $uri;
        }

        $parts = parse_url($uri);
        if (!$parts || !isset($parts['scheme'], $parts['host'], $parts['port']) || $parts['scheme'] !== 'tcp') {
            return Promise\reject(new InvalidArgumentException('Invalid target URI specified'));
        }

        $target = $parts['host'] . ':' . $parts['port'];

        // construct URI to HTTP CONNECT proxy server to connect to
        $proxyUri = $this->proxyUri;

        // append path from URI if given
        if (isset($parts['path'])) {
            $proxyUri .= $parts['path'];
        }

        // parse query args
        $args = array();
        if (isset($parts['query'])) {
            parse_str($parts['query'], $args);
        }

        // append hostname from URI to query string unless explicitly given
        if (!isset($args['hostname'])) {
            $args['hostname'] = trim($parts['host'], '[]');
        }

        // append query string
        $proxyUri .= '?' . http_build_query($args, '', '&');

        // append fragment from URI if given
        if (isset($parts['fragment'])) {
            $proxyUri .= '#' . $parts['fragment'];
        }

        $connecting = $this->connector->connect($proxyUri);

        $deferred = new Deferred(function ($_, $reject) use ($connecting, $uri) {
            $reject(new RuntimeException(
                'Connection to ' . $uri . ' cancelled while waiting for proxy (ECONNABORTED)',
                defined('SOCKET_ECONNABORTED') ? SOCKET_ECONNABORTED : 103
            ));

            // either close active connection or cancel pending connection attempt
            $connecting->then(function (ConnectionInterface $stream) {
                $stream->close();
            }, function () {
                // ignore to avoid reporting unhandled rejection
            });
            $connecting->cancel();
        });

        $headers = $this->headers;
        $connecting->then(function (ConnectionInterface $stream) use ($target, $headers, $deferred, $uri) {
            // keep buffering data until headers are complete
            $buffer = '';
            $stream->on('data', $fn = function ($chunk) use (&$buffer, $deferred, $stream, &$fn, $uri) {
                $buffer .= $chunk;

                $pos = strpos($buffer, "\r\n\r\n");
                if ($pos !== false) {
                    // end of headers received => stop buffering
                    $stream->removeListener('data', $fn);
                    $fn = null;

                    // try to parse headers as response message
                    try {
                        $response = Psr7\parse_response(substr($buffer, 0, $pos));
                    } catch (Exception $e) {
                        $deferred->reject(new RuntimeException(
                            'Connection to ' . $uri . ' failed because proxy returned invalid response (EBADMSG)',
                            defined('SOCKET_EBADMSG') ? SOCKET_EBADMSG: 71,
                            $e
                        ));
                        $stream->close();
                        return;
                    }

                    if ($response->getStatusCode() === 407) {
                        // map status code 407 (Proxy Authentication Required) to EACCES
                        $deferred->reject(new RuntimeException(
                            'Connection to ' . $uri . ' failed because proxy denied access with HTTP error code ' . $response->getStatusCode() . ' (' . $response->getReasonPhrase() . ') (EACCES)',
                            defined('SOCKET_EACCES') ? SOCKET_EACCES : 13
                        ));
                        $stream->close();
                        return;
                    } elseif ($response->getStatusCode() < 200 || $response->getStatusCode() >= 300) {
                        // map non-2xx status code to ECONNREFUSED
                        $deferred->reject(new RuntimeException(
                            'Connection to ' . $uri . ' failed because proxy refused connection with HTTP error code ' . $response->getStatusCode() . ' (' . $response->getReasonPhrase() . ') (ECONNREFUSED)',
                            defined('SOCKET_ECONNREFUSED') ? SOCKET_ECONNREFUSED : 111
                        ));
                        $stream->close();
                        return;
                    }

                    // all okay, resolve with stream instance
                    $deferred->resolve($stream);

                    // emit remaining incoming as data event
                    $buffer = (string)substr($buffer, $pos + 4);
                    if ($buffer !== '') {
                        $stream->emit('data', array($buffer));
                        $buffer = '';
                    }
                    return;
                }

                // stop buffering when 8 KiB have been read
                if (isset($buffer[8192])) {
                    $deferred->reject(new RuntimeException(
                        'Connection to ' . $uri . ' failed because proxy response headers exceed maximum of 8 KiB (EMSGSIZE)',
                        defined('SOCKET_EMSGSIZE') ? SOCKET_EMSGSIZE : 90
                    ));
                    $stream->close();
                }
            });

            $stream->on('error', function (Exception $e) use ($deferred, $uri) {
                $deferred->reject(new RuntimeException(
                    'Connection to ' . $uri . ' failed because connection to proxy caused a stream error (EIO)',
                    defined('SOCKET_EIO') ? SOCKET_EIO : 5,
                    $e
                ));
            });

            $stream->on('close', function () use ($deferred, $uri) {
                $deferred->reject(new RuntimeException(
                    'Connection to ' . $uri . ' failed because connection to proxy was lost while waiting for response (ECONNRESET)',
                    defined('SOCKET_ECONNRESET') ? SOCKET_ECONNRESET : 104
                ));
            });

            $stream->write("CONNECT " . $target . " HTTP/1.1\r\nHost: " . $target . "\r\n" . $headers . "\r\n");
        }, function (Exception $e) use ($deferred, $uri) {
            $deferred->reject($e = new RuntimeException(
                'Connection to ' . $uri . ' failed because connection to proxy failed (ECONNREFUSED)',
                defined('SOCKET_ECONNREFUSED') ? SOCKET_ECONNREFUSED : 111,
                $e
            ));

            // avoid garbage references by replacing all closures in call stack.
            // what a lovely piece of code!
            $r = new \ReflectionProperty('Exception', 'trace');
            $r->setAccessible(true);
            $trace = $r->getValue($e);

            // Exception trace arguments are not available on some PHP 7.4 installs
            // @codeCoverageIgnoreStart
            foreach ($trace as $ti => $one) {
                if (isset($one['args'])) {
                    foreach ($one['args'] as $ai => $arg) {
                        if ($arg instanceof \Closure) {
                            $trace[$ti]['args'][$ai] = 'Object(' . get_class($arg) . ')';
                        }
                    }
                }
            }
            // @codeCoverageIgnoreEnd
            $r->setValue($e, $trace);
        });

        return $deferred->promise();
    }
}
