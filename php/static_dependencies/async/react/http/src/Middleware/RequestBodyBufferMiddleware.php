<?php

namespace React\Http\Middleware;

use OverflowException;
use Psr\Http\Message\ServerRequestInterface;
use React\Http\Io\BufferedBody;
use React\Http\Io\IniUtil;
use React\Promise\Stream;
use React\Stream\ReadableStreamInterface;

final class RequestBodyBufferMiddleware
{
    private $sizeLimit;

    /**
     * @param int|string|null $sizeLimit Either an int with the max request body size
     *                                   in bytes or an ini like size string
     *                                   or null to use post_max_size from PHP's
     *                                   configuration. (Note that the value from
     *                                   the CLI configuration will be used.)
     */
    public function __construct($sizeLimit = null)
    {
        if ($sizeLimit === null) {
            $sizeLimit = \ini_get('post_max_size');
        }

        $this->sizeLimit = IniUtil::iniSizeToBytes($sizeLimit);
    }

    public function __invoke(ServerRequestInterface $request, $stack)
    {
        $body = $request->getBody();
        $size = $body->getSize();

        // happy path: skip if body is known to be empty (or is already buffered)
        if ($size === 0 || !$body instanceof ReadableStreamInterface) {
            // replace with empty body if body is streaming (or buffered size exceeds limit)
            if ($body instanceof ReadableStreamInterface || $size > $this->sizeLimit) {
                $request = $request->withBody(new BufferedBody(''));
            }

            return $stack($request);
        }

        // request body of known size exceeding limit
        $sizeLimit = $this->sizeLimit;
        if ($size > $this->sizeLimit) {
            $sizeLimit = 0;
        }

        return Stream\buffer($body, $sizeLimit)->then(function ($buffer) use ($request, $stack) {
            $request = $request->withBody(new BufferedBody($buffer));

            return $stack($request);
        }, function ($error) use ($stack, $request, $body) {
            // On buffer overflow keep the request body stream in,
            // but ignore the contents and wait for the close event
            // before passing the request on to the next middleware.
            if ($error instanceof OverflowException) {
                return Stream\first($body, 'close')->then(function () use ($stack, $request) {
                    return $stack($request);
                });
            }

            throw $error;
        });
    }
}
