<?php

namespace React\Http\Io;

use Evenement\EventEmitter;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use React\EventLoop\LoopInterface;
use React\Http\Message\Response;
use React\Http\Message\ServerRequest;
use React\Promise;
use React\Promise\CancellablePromiseInterface;
use React\Promise\PromiseInterface;
use React\Socket\ConnectionInterface;
use React\Socket\ServerInterface;
use React\Stream\ReadableStreamInterface;
use React\Stream\WritableStreamInterface;

/**
 * The internal `StreamingServer` class is responsible for handling incoming connections and then
 * processing each incoming HTTP request.
 *
 * Unlike the [`Server`](#server) class, it does not buffer and parse the incoming
 * HTTP request body by default. This means that the request handler will be
 * invoked with a streaming request body. Once the request headers have been
 * received, it will invoke the request handler function. This request handler
 * function needs to be passed to the constructor and will be invoked with the
 * respective [request](#request) object and expects a [response](#response)
 * object in return:
 *
 * ```php
 * $server = new StreamingServer($loop, function (ServerRequestInterface $request) {
 *     return new Response(
 *         200,
 *         array(
 *             'Content-Type' => 'text/plain'
 *         ),
 *         "Hello World!\n"
 *     );
 * });
 * ```
 *
 * Each incoming HTTP request message is always represented by the
 * [PSR-7 `ServerRequestInterface`](https://www.php-fig.org/psr/psr-7/#321-psrhttpmessageserverrequestinterface),
 * see also following [request](#request) chapter for more details.
 * Each outgoing HTTP response message is always represented by the
 * [PSR-7 `ResponseInterface`](https://www.php-fig.org/psr/psr-7/#33-psrhttpmessageresponseinterface),
 * see also following [response](#response) chapter for more details.
 *
 * In order to process any connections, the server needs to be attached to an
 * instance of `React\Socket\ServerInterface` through the [`listen()`](#listen) method
 * as described in the following chapter. In its most simple form, you can attach
 * this to a [`React\Socket\Server`](https://github.com/reactphp/socket#server)
 * in order to start a plaintext HTTP server like this:
 *
 * ```php
 * $server = new StreamingServer($loop, $handler);
 *
 * $socket = new React\Socket\Server('0.0.0.0:8080', $loop);
 * $server->listen($socket);
 * ```
 *
 * See also the [`listen()`](#listen) method and the [first example](examples) for more details.
 *
 * The `StreamingServer` class is considered advanced usage and unless you know
 * what you're doing, you're recommended to use the [`Server`](#server) class
 * instead. The `StreamingServer` class is specifically designed to help with
 * more advanced use cases where you want to have full control over consuming
 * the incoming HTTP request body and concurrency settings.
 *
 * In particular, this class does not buffer and parse the incoming HTTP request
 * in memory. It will invoke the request handler function once the HTTP request
 * headers have been received, i.e. before receiving the potentially much larger
 * HTTP request body. This means the [request](#request) passed to your request
 * handler function may not be fully compatible with PSR-7. See also
 * [streaming request](#streaming-request) below for more details.
 *
 * @see \React\Http\Server
 * @see \React\Http\Message\Response
 * @see self::listen()
 * @internal
 */
final class StreamingServer extends EventEmitter
{
    private $callback;
    private $parser;
    private $loop;

    /**
     * Creates an HTTP server that invokes the given callback for each incoming HTTP request
     *
     * In order to process any connections, the server needs to be attached to an
     * instance of `React\Socket\ServerInterface` which emits underlying streaming
     * connections in order to then parse incoming data as HTTP.
     * See also [listen()](#listen) for more details.
     *
     * @param LoopInterface $loop
     * @param callable $requestHandler
     * @see self::listen()
     */
    public function __construct(LoopInterface $loop, $requestHandler)
    {
        if (!\is_callable($requestHandler)) {
            throw new \InvalidArgumentException('Invalid request handler given');
        }

        $this->loop = $loop;

        $this->callback = $requestHandler;
        $this->parser = new RequestHeaderParser();

        $that = $this;
        $this->parser->on('headers', function (ServerRequestInterface $request, ConnectionInterface $conn) use ($that) {
            $that->handleRequest($conn, $request);
        });

        $this->parser->on('error', function(\Exception $e, ConnectionInterface $conn) use ($that) {
            $that->emit('error', array($e));

            // parsing failed => assume dummy request and send appropriate error
            $that->writeError(
                $conn,
                $e->getCode() !== 0 ? $e->getCode() : 400,
                new ServerRequest('GET', '/')
            );
        });
    }

    /**
     * Starts listening for HTTP requests on the given socket server instance
     *
     * @param ServerInterface $socket
     * @see \React\Http\Server::listen()
     */
    public function listen(ServerInterface $socket)
    {
        $socket->on('connection', array($this->parser, 'handle'));
    }

    /** @internal */
    public function handleRequest(ConnectionInterface $conn, ServerRequestInterface $request)
    {
        if ($request->getProtocolVersion() !== '1.0' && '100-continue' === \strtolower($request->getHeaderLine('Expect'))) {
            $conn->write("HTTP/1.1 100 Continue\r\n\r\n");
        }

        // execute request handler callback
        $callback = $this->callback;
        try {
            $response = $callback($request);
        } catch (\Exception $error) {
            // request handler callback throws an Exception
            $response = Promise\reject($error);
        } catch (\Throwable $error) { // @codeCoverageIgnoreStart
            // request handler callback throws a PHP7+ Error
            $response = Promise\reject($error); // @codeCoverageIgnoreEnd
        }

        // cancel pending promise once connection closes
        if ($response instanceof CancellablePromiseInterface) {
            $conn->on('close', function () use ($response) {
                $response->cancel();
            });
        }

        // happy path: response returned, handle and return immediately
        if ($response instanceof ResponseInterface) {
            return $this->handleResponse($conn, $request, $response);
        }

        // did not return a promise? this is an error, convert into one for rejection below.
        if (!$response instanceof PromiseInterface) {
            $response = Promise\resolve($response);
        }

        $that = $this;
        $response->then(
            function ($response) use ($that, $conn, $request) {
                if (!$response instanceof ResponseInterface) {
                    $message = 'The response callback is expected to resolve with an object implementing Psr\Http\Message\ResponseInterface, but resolved with "%s" instead.';
                    $message = \sprintf($message, \is_object($response) ? \get_class($response) : \gettype($response));
                    $exception = new \RuntimeException($message);

                    $that->emit('error', array($exception));
                    return $that->writeError($conn, 500, $request);
                }
                $that->handleResponse($conn, $request, $response);
            },
            function ($error) use ($that, $conn, $request) {
                $message = 'The response callback is expected to resolve with an object implementing Psr\Http\Message\ResponseInterface, but rejected with "%s" instead.';
                $message = \sprintf($message, \is_object($error) ? \get_class($error) : \gettype($error));

                $previous = null;

                if ($error instanceof \Throwable || $error instanceof \Exception) {
                    $previous = $error;
                }

                $exception = new \RuntimeException($message, null, $previous);

                $that->emit('error', array($exception));
                return $that->writeError($conn, 500, $request);
            }
        );
    }

    /** @internal */
    public function writeError(ConnectionInterface $conn, $code, ServerRequestInterface $request)
    {
        $response = new Response(
            $code,
            array(
                'Content-Type' => 'text/plain'
            ),
            'Error ' . $code
        );

        // append reason phrase to response body if known
        $reason = $response->getReasonPhrase();
        if ($reason !== '') {
            $body = $response->getBody();
            $body->seek(0, SEEK_END);
            $body->write(': ' . $reason);
        }

        $this->handleResponse($conn, $request, $response);
    }


    /** @internal */
    public function handleResponse(ConnectionInterface $connection, ServerRequestInterface $request, ResponseInterface $response)
    {
        // return early and close response body if connection is already closed
        $body = $response->getBody();
        if (!$connection->isWritable()) {
            $body->close();
            return;
        }

        $code = $response->getStatusCode();
        $method = $request->getMethod();

        // assign HTTP protocol version from request automatically
        $version = $request->getProtocolVersion();
        $response = $response->withProtocolVersion($version);

        // assign default "Server" header automatically
        if (!$response->hasHeader('Server')) {
            $response = $response->withHeader('Server', 'ReactPHP/1');
        } elseif ($response->getHeaderLine('Server') === ''){
            $response = $response->withoutHeader('Server');
        }

        // assign default "Date" header from current time automatically
        if (!$response->hasHeader('Date')) {
            // IMF-fixdate  = day-name "," SP date1 SP time-of-day SP GMT
            $response = $response->withHeader('Date', gmdate('D, d M Y H:i:s') . ' GMT');
        } elseif ($response->getHeaderLine('Date') === ''){
            $response = $response->withoutHeader('Date');
        }

        // assign "Content-Length" and "Transfer-Encoding" headers automatically
        $chunked = false;
        if (($method === 'CONNECT' && $code >= 200 && $code < 300) || ($code >= 100 && $code < 200) || $code === 204) {
            // 2xx response to CONNECT and 1xx and 204 MUST NOT include Content-Length or Transfer-Encoding header
            $response = $response->withoutHeader('Content-Length')->withoutHeader('Transfer-Encoding');
        } elseif ($body->getSize() !== null) {
            // assign Content-Length header when using a "normal" buffered body string
            $response = $response->withHeader('Content-Length', (string)$body->getSize())->withoutHeader('Transfer-Encoding');
        } elseif (!$response->hasHeader('Content-Length') && $version === '1.1') {
            // assign chunked transfer-encoding if no 'content-length' is given for HTTP/1.1 responses
            $response = $response->withHeader('Transfer-Encoding', 'chunked');
            $chunked = true;
        } else {
            // remove any Transfer-Encoding headers unless automatically enabled above
            $response = $response->withoutHeader('Transfer-Encoding');
        }

        // assign "Connection" header automatically
        if ($code === 101) {
            // 101 (Switching Protocols) response uses Connection: upgrade header
            $response = $response->withHeader('Connection', 'upgrade');
        } elseif ($version === '1.1') {
            // HTTP/1.1 assumes persistent connection support by default
            // we do not support persistent connections, so let the client know
            $response = $response->withHeader('Connection', 'close');
        } else {
            // remove any Connection headers unless automatically enabled above
            $response = $response->withoutHeader('Connection');
        }

        // 101 (Switching Protocols) response (for Upgrade request) forwards upgraded data through duplex stream
        // 2xx (Successful) response to CONNECT forwards tunneled application data through duplex stream
        if (($code === 101 || ($method === 'CONNECT' && $code >= 200 && $code < 300)) && $body instanceof HttpBodyStream && $body->input instanceof WritableStreamInterface) {
            if ($request->getBody()->isReadable()) {
                // request is still streaming => wait for request close before forwarding following data from connection
                $request->getBody()->on('close', function () use ($connection, $body) {
                    if ($body->input->isWritable()) {
                        $connection->pipe($body->input);
                        $connection->resume();
                    }
                });
            } elseif ($body->input->isWritable()) {
                // request already closed => forward following data from connection
                $connection->pipe($body->input);
                $connection->resume();
            }
        }

        // build HTTP response header by appending status line and header fields
        $headers = "HTTP/" . $version . " " . $code . " " . $response->getReasonPhrase() . "\r\n";
        foreach ($response->getHeaders() as $name => $values) {
            foreach ($values as $value) {
                $headers .= $name . ": " . $value . "\r\n";
            }
        }

        // response to HEAD and 1xx, 204 and 304 responses MUST NOT include a body
        // exclude status 101 (Switching Protocols) here for Upgrade request handling above
        if ($method === 'HEAD' || $code === 100 || ($code > 101 && $code < 200) || $code === 204 || $code === 304) {
            $body = '';
        }

        // this is a non-streaming response body or the body stream already closed?
        if (!$body instanceof ReadableStreamInterface || !$body->isReadable()) {
            // add final chunk if a streaming body is already closed and uses `Transfer-Encoding: chunked`
            if ($body instanceof ReadableStreamInterface && $chunked) {
                $body = "0\r\n\r\n";
            }

            // end connection after writing response headers and body
            $connection->write($headers . "\r\n" . $body);
            $connection->end();
            return;
        }

        $connection->write($headers . "\r\n");

        if ($chunked) {
            $body = new ChunkedEncoder($body);
        }

        // Close response stream once connection closes.
        // Note that this TCP/IP close detection may take some time,
        // in particular this may only fire on a later read/write attempt.
        $connection->on('close', array($body, 'close'));

        $body->pipe($connection);
    }
}
