<?php

namespace React\Http\Middleware;

use Psr\Http\Message\ServerRequestInterface;

/**
 * Process incoming requests with a streaming request body (without buffering).
 *
 * This allows you to process requests of any size without buffering the request
 * body in memory. Instead, it will represent the request body as a
 * [`ReadableStreamInterface`](https://github.com/reactphp/stream#readablestreaminterface)
 * that emit chunks of incoming data as it is received:
 *
 * ```php
 * $server = new React\Http\Server(array(
 *     new React\Http\Middleware\StreamingRequestMiddleware(),
 *     function (Psr\Http\Message\ServerRequestInterface $request) {
 *         $body = $request->getBody();
 *         assert($body instanceof Psr\Http\Message\StreamInterface);
 *         assert($body instanceof React\Stream\ReadableStreamInterface);
 *
 *         return new React\Promise\Promise(function ($resolve) use ($body) {
 *             $bytes = 0;
 *             $body->on('data', function ($chunk) use (&$bytes) {
 *                 $bytes += \count($chunk);
 *             });
 *             $body->on('close', function () use (&$bytes, $resolve) {
 *                 $resolve(new React\Http\Response(
 *                     200,
 *                     [],
 *                     "Received $bytes bytes\n"
 *                 ));
 *             });
 *         });
 *     }
 * ));
 * ```
 *
 * See also [streaming incoming request](../../README.md#streaming-incoming-request)
 * for more details.
 *
 * Additionally, this middleware can be used in combination with the
 * [`LimitConcurrentRequestsMiddleware`](#limitconcurrentrequestsmiddleware) and
 * [`RequestBodyBufferMiddleware`](#requestbodybuffermiddleware) (see below)
 * to explicitly configure the total number of requests that can be handled at
 * once:
 *
 * ```php
 * $server = new React\Http\Server(array(
 *     new React\Http\Middleware\StreamingRequestMiddleware(),
 *     new React\Http\Middleware\LimitConcurrentRequestsMiddleware(100), // 100 concurrent buffering handlers
 *     new React\Http\Middleware\RequestBodyBufferMiddleware(2 * 1024 * 1024), // 2 MiB per request
 *     new React\Http\Middleware\RequestBodyParserMiddleware(),
 *     $handler
 * ));
 * ```
 *
 * > Internally, this class is used as a "marker" to not trigger the default
 *   request buffering behavior in the `Server`. It does not implement any logic
 *   on its own.
 */
final class StreamingRequestMiddleware
{
    public function __invoke(ServerRequestInterface $request, $next)
    {
        return $next($request);
    }
}
