<?php
namespace RingCentral\Psr7;

use Psr\Http\Message\StreamInterface;

/**
 * Stream that when read returns bytes for a streaming multipart or
 * multipart/form-data stream.
 */
class MultipartStream extends StreamDecoratorTrait implements StreamInterface
{

    private $boundary;

    /**
     * @param array  $elements Array of associative arrays, each containing a
     *                         required "name" key mapping to the form field,
     *                         name, a required "contents" key mapping to a
     *                         StreamInterface/resource/string, an optional
     *                         "headers" associative array of custom headers,
     *                         and an optional "filename" key mapping to a
     *                         string to send as the filename in the part.
     * @param string $boundary You can optionally provide a specific boundary
     *
     * @throws \InvalidArgumentException
     */
    public function __construct(array $elements = array(), $boundary = null)
    {
        $this->boundary = $boundary ?: uniqid();
        parent::__construct($this->createStream($elements));
    }

    /**
     * Get the boundary
     *
     * @return string
     */
    public function getBoundary()
    {
        return $this->boundary;
    }

    public function isWritable()
    {
        return false;
    }

    /**
     * Get the headers needed before transferring the content of a POST file
     */
    private function getHeaders(array $headers)
    {
        $str = '';
        foreach ($headers as $key => $value) {
            $str .= "{$key}: {$value}\r\n";
        }

        return "--{$this->boundary}\r\n" . trim($str) . "\r\n\r\n";
    }

    /**
     * Create the aggregate stream that will be used to upload the POST data
     */
    protected function createStream(array $elements)
    {
        $stream = new AppendStream();

        foreach ($elements as $element) {
            $this->addElement($stream, $element);
        }

        // Add the trailing boundary with CRLF
        $stream->addStream(stream_for("--{$this->boundary}--\r\n"));

        return $stream;
    }

    private function addElement(AppendStream $stream, array $element)
    {
        foreach (array('contents', 'name') as $key) {
            if (!array_key_exists($key, $element)) {
                throw new \InvalidArgumentException("A '{$key}' key is required");
            }
        }

        $element['contents'] = stream_for($element['contents']);

        if (empty($element['filename'])) {
            $uri = $element['contents']->getMetadata('uri');
            if (substr($uri, 0, 6) !== 'php://') {
                $element['filename'] = $uri;
            }
        }

        list($body, $headers) = $this->createElement(
            $element['name'],
            $element['contents'],
            isset($element['filename']) ? $element['filename'] : null,
            isset($element['headers']) ? $element['headers'] : array()
        );

        $stream->addStream(stream_for($this->getHeaders($headers)));
        $stream->addStream($body);
        $stream->addStream(stream_for("\r\n"));
    }

    /**
     * @return array
     */
    private function createElement($name, $stream, $filename, array $headers)
    {
        // Set a default content-disposition header if one was no provided
        $disposition = $this->getHeader($headers, 'content-disposition');
        if (!$disposition) {
            $headers['Content-Disposition'] = $filename
                ? sprintf('form-data; name="%s"; filename="%s"',
                    $name,
                    basename($filename))
                : "form-data; name=\"{$name}\"";
        }

        // Set a default content-length header if one was no provided
        $length = $this->getHeader($headers, 'content-length');
        if (!$length) {
            if ($length = $stream->getSize()) {
                $headers['Content-Length'] = (string) $length;
            }
        }

        // Set a default Content-Type if one was not supplied
        $type = $this->getHeader($headers, 'content-type');
        if (!$type && $filename) {
            if ($type = mimetype_from_filename($filename)) {
                $headers['Content-Type'] = $type;
            }
        }

        return array($stream, $headers);
    }

    private function getHeader(array $headers, $key)
    {
        $lowercaseHeader = strtolower($key);
        foreach ($headers as $k => $v) {
            if (strtolower($k) === $lowercaseHeader) {
                return $v;
            }
        }

        return null;
    }
}
