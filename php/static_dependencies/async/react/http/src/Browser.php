<?php

namespace React\Http;

use Psr\Http\Message\ResponseInterface;
use RingCentral\Psr7\Request;
use RingCentral\Psr7\Uri;
use React\EventLoop\LoopInterface;
use React\Http\Io\ReadableBodyStream;
use React\Http\Io\Sender;
use React\Http\Io\Transaction;
use React\Promise\PromiseInterface;
use React\Socket\ConnectorInterface;
use React\Stream\ReadableStreamInterface;
use InvalidArgumentException;

/**
 * @final This class is final and shouldn't be extended as it is likely to be marked final in a future relase.
 */
class Browser
{
    private $transaction;
    private $baseUrl;
    private $protocolVersion = '1.1';

    /**
     * The `Browser` is responsible for sending HTTP requests to your HTTP server
     * and keeps track of pending incoming HTTP responses.
     * It also registers everything with the main [`EventLoop`](https://github.com/reactphp/event-loop#usage).
     *
     * ```php
     * $loop = React\EventLoop\Factory::create();
     *
     * $browser = new React\Http\Browser($loop);
     * ```
     *
     * If you need custom connector settings (DNS resolution, TLS parameters, timeouts,
     * proxy servers etc.), you can explicitly pass a custom instance of the
     * [`ConnectorInterface`](https://github.com/reactphp/socket#connectorinterface):
     *
     * ```php
     * $connector = new React\Socket\Connector($loop, array(
     *     'dns' => '127.0.0.1',
     *     'tcp' => array(
     *         'bindto' => '192.168.10.1:0'
     *     ),
     *     'tls' => array(
     *         'verify_peer' => false,
     *         'verify_peer_name' => false
     *     )
     * ));
     *
     * $browser = new React\Http\Browser($loop, $connector);
     * ```
     *
     * @param LoopInterface $loop
     * @param ConnectorInterface|null $connector [optional] Connector to use.
     *     Should be `null` in order to use default Connector.
     */
    public function __construct(LoopInterface $loop, ConnectorInterface $connector = null)
    {
        $this->transaction = new Transaction(
            Sender::createFromLoop($loop, $connector),
            $loop
        );
    }

    /**
     * Sends an HTTP GET request
     *
     * ```php
     * $browser->get($url)->then(function (Psr\Http\Message\ResponseInterface $response) {
     *     var_dump((string)$response->getBody());
     * });
     * ```
     *
     * See also [GET request client example](../examples/01-client-get-request.php).
     *
     * @param string $url     URL for the request.
     * @param array  $headers
     * @return PromiseInterface<ResponseInterface>
     */
    public function get($url, array $headers = array())
    {
        return $this->requestMayBeStreaming('GET', $url, $headers);
    }

    /**
     * Sends an HTTP POST request
     *
     * ```php
     * $browser->post(
     *     $url,
     *     [
     *         'Content-Type' => 'application/json'
     *     ],
     *     json_encode($data)
     * )->then(function (Psr\Http\Message\ResponseInterface $response) {
     *     var_dump(json_decode((string)$response->getBody()));
     * });
     * ```
     *
     * See also [POST JSON client example](../examples/04-client-post-json.php).
     *
     * This method is also commonly used to submit HTML form data:
     *
     * ```php
     * $data = [
     *     'user' => 'Alice',
     *     'password' => 'secret'
     * ];
     *
     * $browser->post(
     *     $url,
     *     [
     *         'Content-Type' => 'application/x-www-form-urlencoded'
     *     ],
     *     http_build_query($data)
     * );
     * ```
     *
     * This method will automatically add a matching `Content-Length` request
     * header if the outgoing request body is a `string`. If you're using a
     * streaming request body (`ReadableStreamInterface`), it will default to
     * using `Transfer-Encoding: chunked` or you have to explicitly pass in a
     * matching `Content-Length` request header like so:
     *
     * ```php
     * $body = new React\Stream\ThroughStream();
     * $loop->addTimer(1.0, function () use ($body) {
     *     $body->end("hello world");
     * });
     *
     * $browser->post($url, array('Content-Length' => '11'), $body);
     * ```
     *
     * @param string                         $url      URL for the request.
     * @param array                          $headers
     * @param string|ReadableStreamInterface $contents
     * @return PromiseInterface<ResponseInterface>
     */
    public function post($url, array $headers = array(), $contents = '')
    {
        return $this->requestMayBeStreaming('POST', $url, $headers, $contents);
    }

    /**
     * Sends an HTTP HEAD request
     *
     * ```php
     * $browser->head($url)->then(function (Psr\Http\Message\ResponseInterface $response) {
     *     var_dump($response->getHeaders());
     * });
     * ```
     *
     * @param string $url     URL for the request.
     * @param array  $headers
     * @return PromiseInterface<ResponseInterface>
     */
    public function head($url, array $headers = array())
    {
        return $this->requestMayBeStreaming('HEAD', $url, $headers);
    }

    /**
     * Sends an HTTP PATCH request
     *
     * ```php
     * $browser->patch(
     *     $url,
     *     [
     *         'Content-Type' => 'application/json'
     *     ],
     *     json_encode($data)
     * )->then(function (Psr\Http\Message\ResponseInterface $response) {
     *     var_dump(json_decode((string)$response->getBody()));
     * });
     * ```
     *
     * This method will automatically add a matching `Content-Length` request
     * header if the outgoing request body is a `string`. If you're using a
     * streaming request body (`ReadableStreamInterface`), it will default to
     * using `Transfer-Encoding: chunked` or you have to explicitly pass in a
     * matching `Content-Length` request header like so:
     *
     * ```php
     * $body = new React\Stream\ThroughStream();
     * $loop->addTimer(1.0, function () use ($body) {
     *     $body->end("hello world");
     * });
     *
     * $browser->patch($url, array('Content-Length' => '11'), $body);
     * ```
     *
     * @param string                         $url      URL for the request.
     * @param array                          $headers
     * @param string|ReadableStreamInterface $contents
     * @return PromiseInterface<ResponseInterface>
     */
    public function patch($url, array $headers = array(), $contents = '')
    {
        return $this->requestMayBeStreaming('PATCH', $url , $headers, $contents);
    }

    /**
     * Sends an HTTP PUT request
     *
     * ```php
     * $browser->put(
     *     $url,
     *     [
     *         'Content-Type' => 'text/xml'
     *     ],
     *     $xml->asXML()
     * )->then(function (Psr\Http\Message\ResponseInterface $response) {
     *     var_dump((string)$response->getBody());
     * });
     * ```
     *
     * See also [PUT XML client example](../examples/05-client-put-xml.php).
     *
     * This method will automatically add a matching `Content-Length` request
     * header if the outgoing request body is a `string`. If you're using a
     * streaming request body (`ReadableStreamInterface`), it will default to
     * using `Transfer-Encoding: chunked` or you have to explicitly pass in a
     * matching `Content-Length` request header like so:
     *
     * ```php
     * $body = new React\Stream\ThroughStream();
     * $loop->addTimer(1.0, function () use ($body) {
     *     $body->end("hello world");
     * });
     *
     * $browser->put($url, array('Content-Length' => '11'), $body);
     * ```
     *
     * @param string                         $url      URL for the request.
     * @param array                          $headers
     * @param string|ReadableStreamInterface $contents
     * @return PromiseInterface<ResponseInterface>
     */
    public function put($url, array $headers = array(), $contents = '')
    {
        return $this->requestMayBeStreaming('PUT', $url, $headers, $contents);
    }

    /**
     * Sends an HTTP DELETE request
     *
     * ```php
     * $browser->delete($url)->then(function (Psr\Http\Message\ResponseInterface $response) {
     *     var_dump((string)$response->getBody());
     * });
     * ```
     *
     * @param string                         $url      URL for the request.
     * @param array                          $headers
     * @param string|ReadableStreamInterface $contents
     * @return PromiseInterface<ResponseInterface>
     */
    public function delete($url, array $headers = array(), $contents = '')
    {
        return $this->requestMayBeStreaming('DELETE', $url, $headers, $contents);
    }

    /**
     * Sends an arbitrary HTTP request.
     *
     * The preferred way to send an HTTP request is by using the above
     * [request methods](#request-methods), for example the [`get()`](#get)
     * method to send an HTTP `GET` request.
     *
     * As an alternative, if you want to use a custom HTTP request method, you
     * can use this method:
     *
     * ```php
     * $browser->request('OPTIONS', $url)->then(function (Psr\Http\Message\ResponseInterface $response) {
     *     var_dump((string)$response->getBody());
     * });
     * ```
     *
     * This method will automatically add a matching `Content-Length` request
     * header if the size of the outgoing request body is known and non-empty.
     * For an empty request body, if will only include a `Content-Length: 0`
     * request header if the request method usually expects a request body (only
     * applies to `POST`, `PUT` and `PATCH`).
     *
     * If you're using a streaming request body (`ReadableStreamInterface`), it
     * will default to using `Transfer-Encoding: chunked` or you have to
     * explicitly pass in a matching `Content-Length` request header like so:
     *
     * ```php
     * $body = new React\Stream\ThroughStream();
     * $loop->addTimer(1.0, function () use ($body) {
     *     $body->end("hello world");
     * });
     *
     * $browser->request('POST', $url, array('Content-Length' => '11'), $body);
     * ```
     *
     * @param string                         $method   HTTP request method, e.g. GET/HEAD/POST etc.
     * @param string                         $url      URL for the request
     * @param array                          $headers  Additional request headers
     * @param string|ReadableStreamInterface $body     HTTP request body contents
     * @return PromiseInterface<ResponseInterface,Exception>
     */
    public function request($method, $url, array $headers = array(), $body = '')
    {
        return $this->withOptions(array('streaming' => false))->requestMayBeStreaming($method, $url, $headers, $body);
    }

    /**
     * Sends an arbitrary HTTP request and receives a streaming response without buffering the response body.
     *
     * The preferred way to send an HTTP request is by using the above
     * [request methods](#request-methods), for example the [`get()`](#get)
     * method to send an HTTP `GET` request. Each of these methods will buffer
     * the whole response body in memory by default. This is easy to get started
     * and works reasonably well for smaller responses.
     *
     * In some situations, it's a better idea to use a streaming approach, where
     * only small chunks have to be kept in memory. You can use this method to
     * send an arbitrary HTTP request and receive a streaming response. It uses
     * the same HTTP message API, but does not buffer the response body in
     * memory. It only processes the response body in small chunks as data is
     * received and forwards this data through [ReactPHP's Stream API](https://github.com/reactphp/stream).
     * This works for (any number of) responses of arbitrary sizes.
     *
     * ```php
     * $browser->requestStreaming('GET', $url)->then(function (Psr\Http\Message\ResponseInterface $response) {
     *     $body = $response->getBody();
     *     assert($body instanceof Psr\Http\Message\StreamInterface);
     *     assert($body instanceof React\Stream\ReadableStreamInterface);
     *
     *     $body->on('data', function ($chunk) {
     *         echo $chunk;
     *     });
     *
     *     $body->on('error', function (Exception $error) {
     *         echo 'Error: ' . $error->getMessage() . PHP_EOL;
     *     });
     *
     *     $body->on('close', function () {
     *         echo '[DONE]' . PHP_EOL;
     *     });
     * });
     * ```
     *
     * See also [`ReadableStreamInterface`](https://github.com/reactphp/stream#readablestreaminterface)
     * and the [streaming response](#streaming-response) for more details,
     * examples and possible use-cases.
     *
     * This method will automatically add a matching `Content-Length` request
     * header if the size of the outgoing request body is known and non-empty.
     * For an empty request body, if will only include a `Content-Length: 0`
     * request header if the request method usually expects a request body (only
     * applies to `POST`, `PUT` and `PATCH`).
     *
     * If you're using a streaming request body (`ReadableStreamInterface`), it
     * will default to using `Transfer-Encoding: chunked` or you have to
     * explicitly pass in a matching `Content-Length` request header like so:
     *
     * ```php
     * $body = new React\Stream\ThroughStream();
     * $loop->addTimer(1.0, function () use ($body) {
     *     $body->end("hello world");
     * });
     *
     * $browser->requestStreaming('POST', $url, array('Content-Length' => '11'), $body);
     * ```
     *
     * @param string                         $method   HTTP request method, e.g. GET/HEAD/POST etc.
     * @param string                         $url      URL for the request
     * @param array                          $headers  Additional request headers
     * @param string|ReadableStreamInterface $body     HTTP request body contents
     * @return PromiseInterface<ResponseInterface,Exception>
     */
    public function requestStreaming($method, $url, $headers = array(), $contents = '')
    {
        return $this->withOptions(array('streaming' => true))->requestMayBeStreaming($method, $url, $headers, $contents);
    }

    /**
     * Changes the maximum timeout used for waiting for pending requests.
     *
     * You can pass in the number of seconds to use as a new timeout value:
     *
     * ```php
     * $browser = $browser->withTimeout(10.0);
     * ```
     *
     * You can pass in a bool `false` to disable any timeouts. In this case,
     * requests can stay pending forever:
     *
     * ```php
     * $browser = $browser->withTimeout(false);
     * ```
     *
     * You can pass in a bool `true` to re-enable default timeout handling. This
     * will respects PHP's `default_socket_timeout` setting (default 60s):
     *
     * ```php
     * $browser = $browser->withTimeout(true);
     * ```
     *
     * See also [timeouts](#timeouts) for more details about timeout handling.
     *
     * Notice that the [`Browser`](#browser) is an immutable object, i.e. this
     * method actually returns a *new* [`Browser`](#browser) instance with the
     * given timeout value applied.
     *
     * @param bool|number $timeout
     * @return self
     */
    public function withTimeout($timeout)
    {
        if ($timeout === true) {
            $timeout = null;
        } elseif ($timeout === false) {
            $timeout = -1;
        } elseif ($timeout < 0) {
            $timeout = 0;
        }

        return $this->withOptions(array(
            'timeout' => $timeout,
        ));
    }

    /**
     * Changes how HTTP redirects will be followed.
     *
     * You can pass in the maximum number of redirects to follow:
     *
     * ```php
     * $browser = $browser->withFollowRedirects(5);
     * ```
     *
     * The request will automatically be rejected when the number of redirects
     * is exceeded. You can pass in a `0` to reject the request for any
     * redirects encountered:
     *
     * ```php
     * $browser = $browser->withFollowRedirects(0);
     *
     * $browser->get($url)->then(function (Psr\Http\Message\ResponseInterface $response) {
     *     // only non-redirected responses will now end up here
     *     var_dump($response->getHeaders());
     * });
     * ```
     *
     * You can pass in a bool `false` to disable following any redirects. In
     * this case, requests will resolve with the redirection response instead
     * of following the `Location` response header:
     *
     * ```php
     * $browser = $browser->withFollowRedirects(false);
     *
     * $browser->get($url)->then(function (Psr\Http\Message\ResponseInterface $response) {
     *     // any redirects will now end up here
     *     var_dump($response->getHeaderLine('Location'));
     * });
     * ```
     *
     * You can pass in a bool `true` to re-enable default redirect handling.
     * This defaults to following a maximum of 10 redirects:
     *
     * ```php
     * $browser = $browser->withFollowRedirects(true);
     * ```
     *
     * See also [redirects](#redirects) for more details about redirect handling.
     *
     * Notice that the [`Browser`](#browser) is an immutable object, i.e. this
     * method actually returns a *new* [`Browser`](#browser) instance with the
     * given redirect setting applied.
     *
     * @param bool|int $followRedirects
     * @return self
     */
    public function withFollowRedirects($followRedirects)
    {
        return $this->withOptions(array(
            'followRedirects' => $followRedirects !== false,
            'maxRedirects' => \is_bool($followRedirects) ? null : $followRedirects
        ));
    }

    /**
     * Changes whether non-successful HTTP response status codes (4xx and 5xx) will be rejected.
     *
     * You can pass in a bool `false` to disable rejecting incoming responses
     * that use a 4xx or 5xx response status code. In this case, requests will
     * resolve with the response message indicating an error condition:
     *
     * ```php
     * $browser = $browser->withRejectErrorResponse(false);
     *
     * $browser->get($url)->then(function (Psr\Http\Message\ResponseInterface $response) {
     *     // any HTTP response will now end up here
     *     var_dump($response->getStatusCode(), $response->getReasonPhrase());
     * });
     * ```
     *
     * You can pass in a bool `true` to re-enable default status code handling.
     * This defaults to rejecting any response status codes in the 4xx or 5xx
     * range:
     *
     * ```php
     * $browser = $browser->withRejectErrorResponse(true);
     *
     * $browser->get($url)->then(function (Psr\Http\Message\ResponseInterface $response) {
     *     // any successful HTTP response will now end up here
     *     var_dump($response->getStatusCode(), $response->getReasonPhrase());
     * }, function (Exception $e) {
     *     if ($e instanceof React\Http\Message\ResponseException) {
     *         // any HTTP response error message will now end up here
     *         $response = $e->getResponse();
     *         var_dump($response->getStatusCode(), $response->getReasonPhrase());
     *     } else {
     *         var_dump($e->getMessage());
     *     }
     * });
     * ```
     *
     * Notice that the [`Browser`](#browser) is an immutable object, i.e. this
     * method actually returns a *new* [`Browser`](#browser) instance with the
     * given setting applied.
     *
     * @param bool $obeySuccessCode
     * @return self
     */
    public function withRejectErrorResponse($obeySuccessCode)
    {
        return $this->withOptions(array(
            'obeySuccessCode' => $obeySuccessCode,
        ));
    }

    /**
     * Changes the base URL used to resolve relative URLs to.
     *
     * If you configure a base URL, any requests to relative URLs will be
     * processed by first resolving this relative to the given absolute base
     * URL. This supports resolving relative path references (like `../` etc.).
     * This is particularly useful for (RESTful) API calls where all endpoints
     * (URLs) are located under a common base URL.
     *
     * ```php
     * $browser = $browser->withBase('http://api.example.com/v3/');
     *
     * // will request http://api.example.com/v3/users
     * $browser->get('users')->then(…);
     * ```
     *
     * You can pass in a `null` base URL to return a new instance that does not
     * use a base URL:
     *
     * ```php
     * $browser = $browser->withBase(null);
     * ```
     *
     * Accordingly, any requests using relative URLs to a browser that does not
     * use a base URL can not be completed and will be rejected without sending
     * a request.
     *
     * This method will throw an `InvalidArgumentException` if the given
     * `$baseUrl` argument is not a valid URL.
     *
     * Notice that the [`Browser`](#browser) is an immutable object, i.e. the `withBase()` method
     * actually returns a *new* [`Browser`](#browser) instance with the given base URL applied.
     *
     * @param string|null $baseUrl absolute base URL
     * @return self
     * @throws InvalidArgumentException if the given $baseUrl is not a valid absolute URL
     * @see self::withoutBase()
     */
    public function withBase($baseUrl)
    {
        $browser = clone $this;
        if ($baseUrl === null) {
            $browser->baseUrl = null;
            return $browser;
        }

        $browser->baseUrl = new Uri($baseUrl);
        if (!\in_array($browser->baseUrl->getScheme(), array('http', 'https')) || $browser->baseUrl->getHost() === '') {
            throw new \InvalidArgumentException('Base URL must be absolute');
        }

        return $browser;
    }

    /**
     * Changes the HTTP protocol version that will be used for all subsequent requests.
     *
     * All the above [request methods](#request-methods) default to sending
     * requests as HTTP/1.1. This is the preferred HTTP protocol version which
     * also provides decent backwards-compatibility with legacy HTTP/1.0
     * servers. As such, there should rarely be a need to explicitly change this
     * protocol version.
     *
     * If you want to explicitly use the legacy HTTP/1.0 protocol version, you
     * can use this method:
     *
     * ```php
     * $browser = $browser->withProtocolVersion('1.0');
     *
     * $browser->get($url)->then(…);
     * ```
     *
     * Notice that the [`Browser`](#browser) is an immutable object, i.e. this
     * method actually returns a *new* [`Browser`](#browser) instance with the
     * new protocol version applied.
     *
     * @param string $protocolVersion HTTP protocol version to use, must be one of "1.1" or "1.0"
     * @return self
     * @throws InvalidArgumentException
     */
    public function withProtocolVersion($protocolVersion)
    {
        if (!\in_array($protocolVersion, array('1.0', '1.1'), true)) {
            throw new InvalidArgumentException('Invalid HTTP protocol version, must be one of "1.1" or "1.0"');
        }

        $browser = clone $this;
        $browser->protocolVersion = (string) $protocolVersion;

        return $browser;
    }

    /**
     * Changes the maximum size for buffering a response body.
     *
     * The preferred way to send an HTTP request is by using the above
     * [request methods](#request-methods), for example the [`get()`](#get)
     * method to send an HTTP `GET` request. Each of these methods will buffer
     * the whole response body in memory by default. This is easy to get started
     * and works reasonably well for smaller responses.
     *
     * By default, the response body buffer will be limited to 16 MiB. If the
     * response body exceeds this maximum size, the request will be rejected.
     *
     * You can pass in the maximum number of bytes to buffer:
     *
     * ```php
     * $browser = $browser->withResponseBuffer(1024 * 1024);
     *
     * $browser->get($url)->then(function (Psr\Http\Message\ResponseInterface $response) {
     *     // response body will not exceed 1 MiB
     *     var_dump($response->getHeaders(), (string) $response->getBody());
     * });
     * ```
     *
     * Note that the response body buffer has to be kept in memory for each
     * pending request until its transfer is completed and it will only be freed
     * after a pending request is fulfilled. As such, increasing this maximum
     * buffer size to allow larger response bodies is usually not recommended.
     * Instead, you can use the [`requestStreaming()` method](#requeststreaming)
     * to receive responses with arbitrary sizes without buffering. Accordingly,
     * this maximum buffer size setting has no effect on streaming responses.
     *
     * Notice that the [`Browser`](#browser) is an immutable object, i.e. this
     * method actually returns a *new* [`Browser`](#browser) instance with the
     * given setting applied.
     *
     * @param int $maximumSize
     * @return self
     * @see self::requestStreaming()
     */
    public function withResponseBuffer($maximumSize)
    {
        return $this->withOptions(array(
            'maximumSize' => $maximumSize
        ));
    }

    /**
     * Changes the [options](#options) to use:
     *
     * The [`Browser`](#browser) class exposes several options for the handling of
     * HTTP transactions. These options resemble some of PHP's
     * [HTTP context options](http://php.net/manual/en/context.http.php) and
     * can be controlled via the following API (and their defaults):
     *
     * ```php
     * // deprecated
     * $newBrowser = $browser->withOptions(array(
     *     'timeout' => null, // see withTimeout() instead
     *     'followRedirects' => true, // see withFollowRedirects() instead
     *     'maxRedirects' => 10, // see withFollowRedirects() instead
     *     'obeySuccessCode' => true, // see withRejectErrorResponse() instead
     *     'streaming' => false, // deprecated, see requestStreaming() instead
     * ));
     * ```
     *
     * See also [timeouts](#timeouts), [redirects](#redirects) and
     * [streaming](#streaming) for more details.
     *
     * Notice that the [`Browser`](#browser) is an immutable object, i.e. this
     * method actually returns a *new* [`Browser`](#browser) instance with the
     * options applied.
     *
     * @param array $options
     * @return self
     * @see self::withTimeout()
     * @see self::withFollowRedirects()
     * @see self::withRejectErrorResponse()
     */
    private function withOptions(array $options)
    {
        $browser = clone $this;
        $browser->transaction = $this->transaction->withOptions($options);

        return $browser;
    }

    /**
     * @param string                         $method
     * @param string                         $url
     * @param array                          $headers
     * @param string|ReadableStreamInterface $body
     * @return PromiseInterface<ResponseInterface,Exception>
     */
    private function requestMayBeStreaming($method, $url, array $headers = array(), $body = '')
    {
        if ($this->baseUrl !== null) {
            // ensure we're actually below the base URL
            $url = Uri::resolve($this->baseUrl, $url);
        }

        if ($body instanceof ReadableStreamInterface) {
            $body = new ReadableBodyStream($body);
        }

        return $this->transaction->send(
            new Request($method, $url, $headers, $body, $this->protocolVersion)
        );
    }
}
