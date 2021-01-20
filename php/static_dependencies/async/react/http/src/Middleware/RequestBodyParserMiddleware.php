<?php

namespace React\Http\Middleware;

use Psr\Http\Message\ServerRequestInterface;
use React\Http\Io\MultipartParser;

final class RequestBodyParserMiddleware
{
    private $multipart;

    /**
     * @param int|string|null $uploadMaxFilesize
     * @param int|null $maxFileUploads
     */
    public function __construct($uploadMaxFilesize = null, $maxFileUploads = null)
    {
        $this->multipart = new MultipartParser($uploadMaxFilesize, $maxFileUploads);
    }

    public function __invoke(ServerRequestInterface $request, $next)
    {
        $type = \strtolower($request->getHeaderLine('Content-Type'));
        list ($type) = \explode(';', $type);

        if ($type === 'application/x-www-form-urlencoded') {
            return $next($this->parseFormUrlencoded($request));
        }

        if ($type === 'multipart/form-data') {
            return $next($this->multipart->parse($request));
        }

        return $next($request);
    }

    private function parseFormUrlencoded(ServerRequestInterface $request)
    {
        // parse string into array structure
        // ignore warnings due to excessive data structures (max_input_vars and max_input_nesting_level)
        $ret = array();
        @\parse_str((string)$request->getBody(), $ret);

        return $request->withParsedBody($ret);
    }
}
