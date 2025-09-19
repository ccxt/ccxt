# PSR-7 Message Implementation

This repository contains a partial [PSR-7](http://www.php-fig.org/psr/psr-7/)
message implementation, several stream decorators, and some helpful
functionality like query string parsing.  Currently missing
ServerRequestInterface and UploadedFileInterface; a pull request for these features is welcome.


# Stream implementation

This package comes with a number of stream implementations and stream
decorators.


## AppendStream

`RingCentral\Psr7\AppendStream`

Reads from multiple streams, one after the other.

```php
use RingCentral\Psr7;

$a = Psr7\stream_for('abc, ');
$b = Psr7\stream_for('123.');
$composed = new Psr7\AppendStream([$a, $b]);

$composed->addStream(Psr7\stream_for(' Above all listen to me').

echo $composed(); // abc, 123. Above all listen to me.
```


## BufferStream

`RingCentral\Psr7\BufferStream`

Provides a buffer stream that can be written to to fill a buffer, and read
from to remove bytes from the buffer.

This stream returns a "hwm" metadata value that tells upstream consumers
what the configured high water mark of the stream is, or the maximum
preferred size of the buffer.

```php
use RingCentral\Psr7;

// When more than 1024 bytes are in the buffer, it will begin returning
// false to writes. This is an indication that writers should slow down.
$buffer = new Psr7\BufferStream(1024);
```


## CachingStream

The CachingStream is used to allow seeking over previously read bytes on
non-seekable streams. This can be useful when transferring a non-seekable
entity body fails due to needing to rewind the stream (for example, resulting
from a redirect). Data that is read from the remote stream will be buffered in
a PHP temp stream so that previously read bytes are cached first in memory,
then on disk.

```php
use RingCentral\Psr7;

$original = Psr7\stream_for(fopen('http://www.google.com', 'r'));
$stream = new Psr7\CachingStream($original);

$stream->read(1024);
echo $stream->tell();
// 1024

$stream->seek(0);
echo $stream->tell();
// 0
```


## DroppingStream

`RingCentral\Psr7\DroppingStream`

Stream decorator that begins dropping data once the size of the underlying
stream becomes too full.

```php
use RingCentral\Psr7;

// Create an empty stream
$stream = Psr7\stream_for();

// Start dropping data when the stream has more than 10 bytes
$dropping = new Psr7\DroppingStream($stream, 10);

$stream->write('01234567890123456789');
echo $stream; // 0123456789
```


## FnStream

`RingCentral\Psr7\FnStream`

Compose stream implementations based on a hash of functions.

Allows for easy testing and extension of a provided stream without needing to
to create a concrete class for a simple extension point.

```php

use RingCentral\Psr7;

$stream = Psr7\stream_for('hi');
$fnStream = Psr7\FnStream::decorate($stream, [
    'rewind' => function () use ($stream) {
        echo 'About to rewind - ';
        $stream->rewind();
        echo 'rewound!';
    }
]);

$fnStream->rewind();
// Outputs: About to rewind - rewound!
```


## InflateStream

`RingCentral\Psr7\InflateStream`

Uses PHP's zlib.inflate filter to inflate deflate or gzipped content.

This stream decorator skips the first 10 bytes of the given stream to remove
the gzip header, converts the provided stream to a PHP stream resource,
then appends the zlib.inflate filter. The stream is then converted back
to a Guzzle stream resource to be used as a Guzzle stream.


## LazyOpenStream

`RingCentral\Psr7\LazyOpenStream`

Lazily reads or writes to a file that is opened only after an IO operation
take place on the stream.

```php
use RingCentral\Psr7;

$stream = new Psr7\LazyOpenStream('/path/to/file', 'r');
// The file has not yet been opened...

echo $stream->read(10);
// The file is opened and read from only when needed.
```


## LimitStream

`RingCentral\Psr7\LimitStream`

LimitStream can be used to read a subset or slice of an existing stream object.
This can be useful for breaking a large file into smaller pieces to be sent in
chunks (e.g. Amazon S3's multipart upload API).

```php
use RingCentral\Psr7;

$original = Psr7\stream_for(fopen('/tmp/test.txt', 'r+'));
echo $original->getSize();
// >>> 1048576

// Limit the size of the body to 1024 bytes and start reading from byte 2048
$stream = new Psr7\LimitStream($original, 1024, 2048);
echo $stream->getSize();
// >>> 1024
echo $stream->tell();
// >>> 0
```


## MultipartStream

`RingCentral\Psr7\MultipartStream`

Stream that when read returns bytes for a streaming multipart or
multipart/form-data stream.


## NoSeekStream

`RingCentral\Psr7\NoSeekStream`

NoSeekStream wraps a stream and does not allow seeking.

```php
use RingCentral\Psr7;

$original = Psr7\stream_for('foo');
$noSeek = new Psr7\NoSeekStream($original);

echo $noSeek->read(3);
// foo
var_export($noSeek->isSeekable());
// false
$noSeek->seek(0);
var_export($noSeek->read(3));
// NULL
```


## PumpStream

`RingCentral\Psr7\PumpStream`

Provides a read only stream that pumps data from a PHP callable.

When invoking the provided callable, the PumpStream will pass the amount of
data requested to read to the callable. The callable can choose to ignore
this value and return fewer or more bytes than requested. Any extra data
returned by the provided callable is buffered internally until drained using
the read() function of the PumpStream. The provided callable MUST return
false when there is no more data to read.


## Implementing stream decorators

Creating a stream decorator is very easy thanks to the
`RingCentral\Psr7\StreamDecoratorTrait`. This trait provides methods that
implement `Psr\Http\Message\StreamInterface` by proxying to an underlying
stream. Just `use` the `StreamDecoratorTrait` and implement your custom
methods.

For example, let's say we wanted to call a specific function each time the last
byte is read from a stream. This could be implemented by overriding the
`read()` method.

```php
use Psr\Http\Message\StreamInterface;
use RingCentral\Psr7\StreamDecoratorTrait;

class EofCallbackStream implements StreamInterface
{
    use StreamDecoratorTrait;

    private $callback;

    public function __construct(StreamInterface $stream, callable $cb)
    {
        $this->stream = $stream;
        $this->callback = $cb;
    }

    public function read($length)
    {
        $result = $this->stream->read($length);

        // Invoke the callback when EOF is hit.
        if ($this->eof()) {
            call_user_func($this->callback);
        }

        return $result;
    }
}
```

This decorator could be added to any existing stream and used like so:

```php
use RingCentral\Psr7;

$original = Psr7\stream_for('foo');

$eofStream = new EofCallbackStream($original, function () {
    echo 'EOF!';
});

$eofStream->read(2);
$eofStream->read(1);
// echoes "EOF!"
$eofStream->seek(0);
$eofStream->read(3);
// echoes "EOF!"
```


## PHP StreamWrapper

You can use the `RingCentral\Psr7\StreamWrapper` class if you need to use a
PSR-7 stream as a PHP stream resource.

Use the `RingCentral\Psr7\StreamWrapper::getResource()` method to create a PHP
stream from a PSR-7 stream.

```php
use RingCentral\Psr7\StreamWrapper;

$stream = RingCentral\Psr7\stream_for('hello!');
$resource = StreamWrapper::getResource($stream);
echo fread($resource, 6); // outputs hello!
```


# Function API

There are various functions available under the `RingCentral\Psr7` namespace.


## `function str`

`function str(MessageInterface $message)`

Returns the string representation of an HTTP message.

```php
$request = new RingCentral\Psr7\Request('GET', 'http://example.com');
echo RingCentral\Psr7\str($request);
```


## `function uri_for`

`function uri_for($uri)`

This function accepts a string or `Psr\Http\Message\UriInterface` and returns a
UriInterface for the given value. If the value is already a `UriInterface`, it
is returned as-is.

```php
$uri = RingCentral\Psr7\uri_for('http://example.com');
assert($uri === RingCentral\Psr7\uri_for($uri));
```


## `function stream_for`

`function stream_for($resource = '', array $options = [])`

Create a new stream based on the input type.

Options is an associative array that can contain the following keys:

* - metadata: Array of custom metadata.
* - size: Size of the stream.

This method accepts the following `$resource` types:

- `Psr\Http\Message\StreamInterface`: Returns the value as-is.
- `string`: Creates a stream object that uses the given string as the contents.
- `resource`: Creates a stream object that wraps the given PHP stream resource.
- `Iterator`: If the provided value implements `Iterator`, then a read-only
  stream object will be created that wraps the given iterable. Each time the
  stream is read from, data from the iterator will fill a buffer and will be
  continuously called until the buffer is equal to the requested read size.
  Subsequent read calls will first read from the buffer and then call `next`
  on the underlying iterator until it is exhausted.
- `object` with `__toString()`: If the object has the `__toString()` method,
  the object will be cast to a string and then a stream will be returned that
  uses the string value.
- `NULL`: When `null` is passed, an empty stream object is returned.
- `callable` When a callable is passed, a read-only stream object will be
  created that invokes the given callable. The callable is invoked with the
  number of suggested bytes to read. The callable can return any number of
  bytes, but MUST return `false` when there is no more data to return. The
  stream object that wraps the callable will invoke the callable until the
  number of requested bytes are available. Any additional bytes will be
  buffered and used in subsequent reads.

```php
$stream = RingCentral\Psr7\stream_for('foo');
$stream = RingCentral\Psr7\stream_for(fopen('/path/to/file', 'r'));

$generator function ($bytes) {
    for ($i = 0; $i < $bytes; $i++) {
        yield ' ';
    }
}

$stream = RingCentral\Psr7\stream_for($generator(100));
```


## `function parse_header`

`function parse_header($header)`

Parse an array of header values containing ";" separated data into an array of
associative arrays representing the header key value pair data of the header.
When a parameter does not contain a value, but just contains a key, this
function will inject a key with a '' string value.


## `function normalize_header`

`function normalize_header($header)`

Converts an array of header values that may contain comma separated headers
into an array of headers with no comma separated values.


## `function modify_request`

`function modify_request(RequestInterface $request, array $changes)`

Clone and modify a request with the given changes. This method is useful for
reducing the number of clones needed to mutate a message.

The changes can be one of:

- method: (string) Changes the HTTP method.
- set_headers: (array) Sets the given headers.
- remove_headers: (array) Remove the given headers.
- body: (mixed) Sets the given body.
- uri: (UriInterface) Set the URI.
- query: (string) Set the query string value of the URI.
- version: (string) Set the protocol version.


## `function rewind_body`

`function rewind_body(MessageInterface $message)`

Attempts to rewind a message body and throws an exception on failure. The body
of the message will only be rewound if a call to `tell()` returns a value other
than `0`.


## `function try_fopen`

`function try_fopen($filename, $mode)`

Safely opens a PHP stream resource using a filename.

When fopen fails, PHP normally raises a warning. This function adds an error
handler that checks for errors and throws an exception instead.


## `function copy_to_string`

`function copy_to_string(StreamInterface $stream, $maxLen = -1)`

Copy the contents of a stream into a string until the given number of bytes
have been read.


## `function copy_to_stream`

`function copy_to_stream(StreamInterface $source, StreamInterface $dest, $maxLen = -1)`

Copy the contents of a stream into another stream until the given number of
bytes have been read.


## `function hash`

`function hash(StreamInterface $stream, $algo, $rawOutput = false)`

Calculate a hash of a Stream. This method reads the entire stream to calculate
a rolling hash (based on PHP's hash_init functions).


## `function readline`

`function readline(StreamInterface $stream, $maxLength = null)`

Read a line from the stream up to the maximum allowed buffer length.


## `function parse_request`

`function parse_request($message)`

Parses a request message string into a request object.


## `function parse_server_request`

`function parse_server_request($message, array $serverParams = array())`

Parses a request message string into a server-side request object.


## `function parse_response`

`function parse_response($message)`

Parses a response message string into a response object.


## `function parse_query`

`function parse_query($str, $urlEncoding = true)`

Parse a query string into an associative array.

If multiple values are found for the same key, the value of that key value pair
will become an array. This function does not parse nested PHP style arrays into
an associative array (e.g., `foo[a]=1&foo[b]=2` will be parsed into
`['foo[a]' => '1', 'foo[b]' => '2']`).


## `function build_query`

`function build_query(array $params, $encoding = PHP_QUERY_RFC3986)`

Build a query string from an array of key value pairs.

This function can use the return value of parseQuery() to build a query string.
This function does not modify the provided keys when an array is encountered
(like http_build_query would).


## `function mimetype_from_filename`

`function mimetype_from_filename($filename)`

Determines the mimetype of a file by looking at its extension.


## `function mimetype_from_extension`

`function mimetype_from_extension($extension)`

Maps a file extensions to a mimetype.


# Static URI methods

The `RingCentral\Psr7\Uri` class has several static methods to manipulate URIs.


## `RingCentral\Psr7\Uri::removeDotSegments`

`public static function removeDotSegments($path) -> UriInterface`

Removes dot segments from a path and returns the new path.

See http://tools.ietf.org/html/rfc3986#section-5.2.4


## `RingCentral\Psr7\Uri::resolve`

`public static function resolve(UriInterface $base, $rel) -> UriInterface`

Resolve a base URI with a relative URI and return a new URI.

See http://tools.ietf.org/html/rfc3986#section-5


## `RingCentral\Psr7\Uri::withQueryValue`

`public static function withQueryValue(UriInterface $uri, $key, $value) -> UriInterface`

Create a new URI with a specific query string value.

Any existing query string values that exactly match the provided key are
removed and replaced with the given key value pair.

Note: this function will convert "=" to "%3D" and "&" to "%26".


## `RingCentral\Psr7\Uri::withoutQueryValue`

`public static function withoutQueryValue(UriInterface $uri, $key, $value) -> UriInterface`

Create a new URI with a specific query string value removed.

Any existing query string values that exactly match the provided key are
removed.

Note: this function will convert "=" to "%3D" and "&" to "%26".


## `RingCentral\Psr7\Uri::fromParts`

`public static function fromParts(array $parts) -> UriInterface`

Create a `RingCentral\Psr7\Uri` object from a hash of `parse_url` parts.


# Not Implemented

A few aspects of PSR-7 are not implemented in this project. A pull request for
any of these features is welcome:

- `Psr\Http\Message\ServerRequestInterface`
- `Psr\Http\Message\UploadedFileInterface`
