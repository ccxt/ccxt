<?php

namespace React\Http;

use Evenement\EventEmitter;
use React\EventLoop\LoopInterface;
use React\Http\Io\IniUtil;
use React\Http\Io\MiddlewareRunner;
use React\Http\Io\StreamingServer;
use React\Http\Middleware\LimitConcurrentRequestsMiddleware;
use React\Http\Middleware\StreamingRequestMiddleware;
use React\Http\Middleware\RequestBodyBufferMiddleware;
use React\Http\Middleware\RequestBodyParserMiddleware;
use React\Socket\ServerInterface;

/**
 * The `React\Http\Server` class is responsible for handling incoming connections and then
 * processing each incoming HTTP request.
 *
 * When a complete HTTP request has been received, it will invoke the given
 * request handler function. This request handler function needs to be passed to
 * the constructor and will be invoked with the respective [request](#server-request)
 * object and expects a [response](#server-response) object in return:
 *
 * ```php
 * $server = new React\Http\Server($loop, function (Psr\Http\Message\ServerRequestInterface $request) {
 *     return new React\Http\Message\Response(
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
 * see also following [request](#server-request) chapter for more details.
 *
 * Each outgoing HTTP response message is always represented by the
 * [PSR-7 `ResponseInterface`](https://www.php-fig.org/psr/psr-7/#33-psrhttpmessageresponseinterface),
 * see also following [response](#server-response) chapter for more details.
 *
 * In order to start listening for any incoming connections, the `Server` needs
 * to be attached to an instance of
 * [`React\Socket\ServerInterface`](https://github.com/reactphp/socket#serverinterface)
 * through the [`listen()`](#listen) method as described in the following
 * chapter. In its most simple form, you can attach this to a
 * [`React\Socket\Server`](https://github.com/reactphp/socket#server) in order
 * to start a plaintext HTTP server like this:
 *
 * ```php
 * $server = new React\Http\Server($loop, $handler);
 *
 * $socket = new React\Socket\Server('0.0.0.0:8080', $loop);
 * $server->listen($socket);
 * ```
 *
 * See also the [`listen()`](#listen) method and
 * [hello world server example](../examples/51-server-hello-world.php)
 * for more details.
 *
 * By default, the `Server` buffers and parses the complete incoming HTTP
 * request in memory. It will invoke the given request handler function when the
 * complete request headers and request body has been received. This means the
 * [request](#server-request) object passed to your request handler function will be
 * fully compatible with PSR-7 (http-message). This provides sane defaults for
 * 80% of the use cases and is the recommended way to use this library unless
 * you're sure you know what you're doing.
 *
 * On the other hand, buffering complete HTTP requests in memory until they can
 * be processed by your request handler function means that this class has to
 * employ a number of limits to avoid consuming too much memory. In order to
 * take the more advanced configuration out your hand, it respects setting from
 * your [`php.ini`](https://www.php.net/manual/en/ini.core.php) to apply its
 * default settings. This is a list of PHP settings this class respects with
 * their respective default values:
 *
 * ```
 * memory_limit 128M
 * post_max_size 8M // capped at 64K
 *
 * enable_post_data_reading 1
 * max_input_nesting_level 64
 * max_input_vars 1000
 *
 * file_uploads 1
 * upload_max_filesize 2M
 * max_file_uploads 20
 * ```
 *
 * In particular, the `post_max_size` setting limits how much memory a single
 * HTTP request is allowed to consume while buffering its request body. This
 * needs to be limited because the server can process a large number of requests
 * concurrently, so the server may potentially consume a large amount of memory
 * otherwise. To support higher concurrency by default, this value is capped
 * at `64K`. If you assign a higher value, it will only allow `64K` by default.
 * If a request exceeds this limit, its request body will be ignored and it will
 * be processed like a request with no request body at all. See below for
 * explicit configuration to override this setting.
 *
 * By default, this class will try to avoid consuming more than half of your
 * `memory_limit` for buffering multiple concurrent HTTP requests. As such, with
 * the above default settings of `128M` max, it will try to consume no more than
 * `64M` for buffering multiple concurrent HTTP requests. As a consequence, it
 * will limit the concurrency to `1024` HTTP requests with the above defaults.
 *
 * It is imperative that you assign reasonable values to your PHP ini settings.
 * It is usually recommended to not support buffering incoming HTTP requests
 * with a large HTTP request body (e.g. large file uploads). If you want to
 * increase this buffer size, you will have to also increase the total memory
 * limit to allow for more concurrent requests (set `memory_limit 512M` or more)
 * or explicitly limit concurrency.
 *
 * In order to override the above buffering defaults, you can configure the
 * `Server` explicitly. You can use the
 * [`LimitConcurrentRequestsMiddleware`](#limitconcurrentrequestsmiddleware) and
 * [`RequestBodyBufferMiddleware`](#requestbodybuffermiddleware) (see below)
 * to explicitly configure the total number of requests that can be handled at
 * once like this:
 *
 * ```php
 * $server = new React\Http\Server(
 *     $loop,
 *     new React\Http\Middleware\StreamingRequestMiddleware(),
 *     new React\Http\Middleware\LimitConcurrentRequestsMiddleware(100), // 100 concurrent buffering handlers
 *     new React\Http\Middleware\RequestBodyBufferMiddleware(2 * 1024 * 1024), // 2 MiB per request
 *     new React\Http\Middleware\RequestBodyParserMiddleware(),
 *     $handler
 * ));
 * ```
 *
 * In this example, we allow processing up to 100 concurrent requests at once
 * and each request can buffer up to `2M`. This means you may have to keep a
 * maximum of `200M` of memory for incoming request body buffers. Accordingly,
 * you need to adjust the `memory_limit` ini setting to allow for these buffers
 * plus your actual application logic memory requirements (think `512M` or more).
 *
 * > Internally, this class automatically assigns these middleware handlers
 *   automatically when no [`StreamingRequestMiddleware`](#streamingrequestmiddleware)
 *   is given. Accordingly, you can use this example to override all default
 *   settings to implement custom limits.
 *
 * As an alternative to buffering the complete request body in memory, you can
 * also use a streaming approach where only small chunks of data have to be kept
 * in memory:
 *
 * ```php
 * $server = new React\Http\Server(
 *     $loop,
 *     new React\Http\Middleware\StreamingRequestMiddleware(),
 *     $handler
 * );
 * ```
 *
 * In this case, it will invoke the request handler function once the HTTP
 * request headers have been received, i.e. before receiving the potentially
 * much larger HTTP request body. This means the [request](#server-request) passed to
 * your request handler function may not be fully compatible with PSR-7. This is
 * specifically designed to help with more advanced use cases where you want to
 * have full control over consuming the incoming HTTP request body and
 * concurrency settings. See also [streaming incoming request](#streaming-incoming-request)
 * below for more details.
 */
final class Server extends EventEmitter
{
    /**
     * The maximum buffer size used for each request.
     *
     * This needs to be limited because the server can process a large number of
     * requests concurrently, so the server may potentially consume a large
     * amount of memory otherwise.
     *
     * See `RequestBodyBufferMiddleware` to override this setting.
     *
     * @internal
     */
    const MAXIMUM_BUFFER_SIZE = 65536; // 64 KiB

    /**
     * @var StreamingServer
     */
    private $streamingServer;

    /**
     * Creates an HTTP server that invokes the given callback for each incoming HTTP request
     *
     * In order to process any connections, the server needs to be attached to an
     * instance of `React\Socket\ServerInterface` which emits underlying streaming
     * connections in order to then parse incoming data as HTTP.
     * See also [listen()](#listen) for more details.
     *
     * @param LoopInterface $loop
     * @param callable[] ...$requestHandler
     * @see self::listen()
     */
    public function __construct(LoopInterface $loop)
    {
        $requestHandlers = \func_get_args();
        \array_shift($requestHandlers);
        $requestHandlersCount = \count($requestHandlers);
        if ($requestHandlersCount === 0 || \count(\array_filter($requestHandlers, 'is_callable')) < $requestHandlersCount) {
            throw new \InvalidArgumentException('Invalid request handler given');
        }

        $streaming = false;
        foreach ((array) $requestHandlers as $handler) {
            if ($handler instanceof StreamingRequestMiddleware) {
                $streaming = true;
                break;
            }
        }

        $middleware = array();
        if (!$streaming) {
            $maxSize = $this->getMaxRequestSize();
            $concurrency = $this->getConcurrentRequestsLimit(\ini_get('memory_limit'), $maxSize);
            if ($concurrency !== null) {
                $middleware[] = new LimitConcurrentRequestsMiddleware($concurrency);
            }
            $middleware[] = new RequestBodyBufferMiddleware($maxSize);
            // Checking for an empty string because that is what a boolean
            // false is returned as by ini_get depending on the PHP version.
            // @link http://php.net/manual/en/ini.core.php#ini.enable-post-data-reading
            // @link http://php.net/manual/en/function.ini-get.php#refsect1-function.ini-get-notes
            // @link https://3v4l.org/qJtsa
            $enablePostDataReading = \ini_get('enable_post_data_reading');
            if ($enablePostDataReading !== '') {
                $middleware[] = new RequestBodyParserMiddleware();
            }
        }

        $middleware = \array_merge($middleware, $requestHandlers);

        $this->streamingServer = new StreamingServer($loop, new MiddlewareRunner($middleware));

        $that = $this;
        $this->streamingServer->on('error', function ($error) use ($that) {
            $that->emit('error', array($error));
        });
    }

    /**
     * Starts listening for HTTP requests on the given socket server instance
     *
     * The given [`React\Socket\ServerInterface`](https://github.com/reactphp/socket#serverinterface)
     * is responsible for emitting the underlying streaming connections. This
     * HTTP server needs to be attached to it in order to process any
     * connections and pase incoming streaming data as incoming HTTP request
     * messages. In its most common form, you can attach this to a
     * [`React\Socket\Server`](https://github.com/reactphp/socket#server) in
     * order to start a plaintext HTTP server like this:
     *
     * ```php
     * $server = new React\Http\Server($loop, $handler);
     *
     * $socket = new React\Socket\Server(8080, $loop);
     * $server->listen($socket);
     * ```
     *
     * See also [hello world server example](../examples/51-server-hello-world.php)
     * for more details.
     *
     * This example will start listening for HTTP requests on the alternative
     * HTTP port `8080` on all interfaces (publicly). As an alternative, it is
     * very common to use a reverse proxy and let this HTTP server listen on the
     * localhost (loopback) interface only by using the listen address
     * `127.0.0.1:8080` instead. This way, you host your application(s) on the
     * default HTTP port `80` and only route specific requests to this HTTP
     * server.
     *
     * Likewise, it's usually recommended to use a reverse proxy setup to accept
     * secure HTTPS requests on default HTTPS port `443` (TLS termination) and
     * only route plaintext requests to this HTTP server. As an alternative, you
     * can also accept secure HTTPS requests with this HTTP server by attaching
     * this to a [`React\Socket\Server`](https://github.com/reactphp/socket#server)
     * using a secure TLS listen address, a certificate file and optional
     * `passphrase` like this:
     *
     * ```php
     * $server = new React\Http\Server($loop, $handler);
     *
     * $socket = new React\Socket\Server('tls://0.0.0.0:8443', $loop, array(
     *     'local_cert' => __DIR__ . '/localhost.pem'
     * ));
     * $server->listen($socket);
     * ```
     *
     * See also [hello world HTTPS example](../examples/61-server-hello-world-https.php)
     * for more details.
     *
     * @param ServerInterface $socket
     */
    public function listen(ServerInterface $socket)
    {
        $this->streamingServer->listen($socket);
    }

    /**
     * @param string $memory_limit
     * @param string $post_max_size
     * @return ?int
     */
    private function getConcurrentRequestsLimit($memory_limit, $post_max_size)
    {
        if ($memory_limit == -1) {
            return null;
        }

        $availableMemory = IniUtil::iniSizeToBytes($memory_limit) / 2;
        $concurrentRequests = (int) \ceil($availableMemory / IniUtil::iniSizeToBytes($post_max_size));

        return $concurrentRequests;
    }

    /**
     * @param ?string $post_max_size
     * @return int
     */
    private function getMaxRequestSize($post_max_size = null)
    {
        $maxSize = IniUtil::iniSizeToBytes($post_max_size === null ? \ini_get('post_max_size') : $post_max_size);

        return ($maxSize === 0 || $maxSize >= self::MAXIMUM_BUFFER_SIZE) ? self::MAXIMUM_BUFFER_SIZE : $maxSize;
    }
}
