<?php
namespace RingCentral\Psr7;

use Psr\Http\Message\ResponseInterface;

/**
 * PSR-7 response implementation.
 */
class Response extends MessageTrait implements ResponseInterface
{

    /** @var array Map of standard HTTP status code/reason phrases */
    private static $phrases = array(
        100 => 'Continue',
        101 => 'Switching Protocols',
        102 => 'Processing',
        200 => 'OK',
        201 => 'Created',
        202 => 'Accepted',
        203 => 'Non-Authoritative Information',
        204 => 'No Content',
        205 => 'Reset Content',
        206 => 'Partial Content',
        207 => 'Multi-status',
        208 => 'Already Reported',
        300 => 'Multiple Choices',
        301 => 'Moved Permanently',
        302 => 'Found',
        303 => 'See Other',
        304 => 'Not Modified',
        305 => 'Use Proxy',
        306 => 'Switch Proxy',
        307 => 'Temporary Redirect',
        400 => 'Bad Request',
        401 => 'Unauthorized',
        402 => 'Payment Required',
        403 => 'Forbidden',
        404 => 'Not Found',
        405 => 'Method Not Allowed',
        406 => 'Not Acceptable',
        407 => 'Proxy Authentication Required',
        408 => 'Request Time-out',
        409 => 'Conflict',
        410 => 'Gone',
        411 => 'Length Required',
        412 => 'Precondition Failed',
        413 => 'Request Entity Too Large',
        414 => 'Request-URI Too Large',
        415 => 'Unsupported Media Type',
        416 => 'Requested range not satisfiable',
        417 => 'Expectation Failed',
        418 => 'I\'m a teapot',
        422 => 'Unprocessable Entity',
        423 => 'Locked',
        424 => 'Failed Dependency',
        425 => 'Unordered Collection',
        426 => 'Upgrade Required',
        428 => 'Precondition Required',
        429 => 'Too Many Requests',
        431 => 'Request Header Fields Too Large',
        500 => 'Internal Server Error',
        501 => 'Not Implemented',
        502 => 'Bad Gateway',
        503 => 'Service Unavailable',
        504 => 'Gateway Time-out',
        505 => 'HTTP Version not supported',
        506 => 'Variant Also Negotiates',
        507 => 'Insufficient Storage',
        508 => 'Loop Detected',
        511 => 'Network Authentication Required',
    );

    /** @var null|string */
    private $reasonPhrase = '';

    /** @var int */
    private $statusCode = 200;

    /**
     * @param int    $status  Status code for the response, if any.
     * @param array  $headers Headers for the response, if any.
     * @param mixed  $body    Stream body.
     * @param string $version Protocol version.
     * @param string $reason  Reason phrase (a default will be used if possible).
     */
    public function __construct(
        $status = 200,
        array $headers = array(),
        $body = null,
        $version = '1.1',
        $reason = null
    ) {
        $this->statusCode = (int) $status;

        if ($body !== null) {
            $this->stream = stream_for($body);
        }

        $this->setHeaders($headers);
        if (!$reason && isset(self::$phrases[$this->statusCode])) {
            $this->reasonPhrase = self::$phrases[$status];
        } else {
            $this->reasonPhrase = (string) $reason;
        }

        $this->protocol = $version;
    }

    public function getStatusCode()
    {
        return $this->statusCode;
    }

    public function getReasonPhrase()
    {
        return $this->reasonPhrase;
    }

    public function withStatus($code, $reasonPhrase = '')
    {
        $new = clone $this;
        $new->statusCode = (int) $code;
        if (!$reasonPhrase && isset(self::$phrases[$new->statusCode])) {
            $reasonPhrase = self::$phrases[$new->statusCode];
        }
        $new->reasonPhrase = $reasonPhrase;
        return $new;
    }
}
