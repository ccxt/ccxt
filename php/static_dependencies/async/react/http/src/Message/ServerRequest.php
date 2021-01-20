<?php

namespace React\Http\Message;

use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\StreamInterface;
use Psr\Http\Message\UriInterface;
use React\Http\Io\HttpBodyStream;
use React\Stream\ReadableStreamInterface;
use RingCentral\Psr7\Request;

/**
 * Respresents an incoming server request message.
 *
 * This class implements the
 * [PSR-7 `ServerRequestInterface`](https://www.php-fig.org/psr/psr-7/#321-psrhttpmessageserverrequestinterface)
 * which extends the
 * [PSR-7 `RequestInterface`](https://www.php-fig.org/psr/psr-7/#32-psrhttpmessagerequestinterface)
 * which in turn extends the
 * [PSR-7 `MessageInterface`](https://www.php-fig.org/psr/psr-7/#31-psrhttpmessagemessageinterface).
 *
 * This is mostly used internally to represent each incoming request message.
 * Likewise, you can also use this class in test cases to test how your web
 * application reacts to certain HTTP requests.
 *
 * > Internally, this implementation builds on top of an existing outgoing
 *   request message and only adds required server methods. This base class is
 *   considered an implementation detail that may change in the future.
 *
 * @see ServerRequestInterface
 */
final class ServerRequest extends Request implements ServerRequestInterface
{
    private $attributes = array();

    private $serverParams;
    private $fileParams = array();
    private $cookies = array();
    private $queryParams = array();
    private $parsedBody;

    /**
     * @param string                                         $method       HTTP method for the request.
     * @param string|UriInterface                            $url          URL for the request.
     * @param array<string,string|string[]>                  $headers      Headers for the message.
     * @param string|ReadableStreamInterface|StreamInterface $body         Message body.
     * @param string                                         $version      HTTP protocol version.
     * @param array<string,string>                           $serverParams server-side parameters
     * @throws \InvalidArgumentException for an invalid URL or body
     */
    public function __construct(
        $method,
        $url,
        array $headers = array(),
        $body = '',
        $version = '1.1',
        $serverParams = array()
    ) {
        $stream = null;
        if ($body instanceof ReadableStreamInterface && !$body instanceof StreamInterface) {
            $stream = $body;
            $body = null;
        } elseif (!\is_string($body) && !$body instanceof StreamInterface) {
            throw new \InvalidArgumentException('Invalid server request body given');
        }

        $this->serverParams = $serverParams;
        parent::__construct($method, $url, $headers, $body, $version);

        if ($stream !== null) {
            $size = (int) $this->getHeaderLine('Content-Length');
            if (\strtolower($this->getHeaderLine('Transfer-Encoding')) === 'chunked') {
                $size = null;
            }
            $this->stream = new HttpBodyStream($stream, $size);
        }

        $query = $this->getUri()->getQuery();
        if ($query !== '') {
            \parse_str($query, $this->queryParams);
        }

        // Multiple cookie headers are not allowed according
        // to https://tools.ietf.org/html/rfc6265#section-5.4
        $cookieHeaders = $this->getHeader("Cookie");

        if (count($cookieHeaders) === 1) {
            $this->cookies = $this->parseCookie($cookieHeaders[0]);
        }
    }

    public function getServerParams()
    {
        return $this->serverParams;
    }

    public function getCookieParams()
    {
        return $this->cookies;
    }

    public function withCookieParams(array $cookies)
    {
        $new = clone $this;
        $new->cookies = $cookies;
        return $new;
    }

    public function getQueryParams()
    {
        return $this->queryParams;
    }

    public function withQueryParams(array $query)
    {
        $new = clone $this;
        $new->queryParams = $query;
        return $new;
    }

    public function getUploadedFiles()
    {
        return $this->fileParams;
    }

    public function withUploadedFiles(array $uploadedFiles)
    {
        $new = clone $this;
        $new->fileParams = $uploadedFiles;
        return $new;
    }

    public function getParsedBody()
    {
        return $this->parsedBody;
    }

    public function withParsedBody($data)
    {
        $new = clone $this;
        $new->parsedBody = $data;
        return $new;
    }

    public function getAttributes()
    {
        return $this->attributes;
    }

    public function getAttribute($name, $default = null)
    {
        if (!\array_key_exists($name, $this->attributes)) {
            return $default;
        }
        return $this->attributes[$name];
    }

    public function withAttribute($name, $value)
    {
        $new = clone $this;
        $new->attributes[$name] = $value;
        return $new;
    }

    public function withoutAttribute($name)
    {
        $new = clone $this;
        unset($new->attributes[$name]);
        return $new;
    }

    /**
     * @param string $cookie
     * @return array
     */
    private function parseCookie($cookie)
    {
        $cookieArray = \explode(';', $cookie);
        $result = array();

        foreach ($cookieArray as $pair) {
            $pair = \trim($pair);
            $nameValuePair = \explode('=', $pair, 2);

            if (\count($nameValuePair) === 2) {
                $key = \urldecode($nameValuePair[0]);
                $value = \urldecode($nameValuePair[1]);
                $result[$key] = $value;
            }
        }

        return $result;
    }
}
