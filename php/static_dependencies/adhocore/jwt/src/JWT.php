<?php

namespace Ahc\Jwt;

require_once ('ValidatesJWT.php');
require_once ('JWTException.php');

use Ahc\Jwt\JWTException;

/**
 * JSON Web Token (JWT) implementation in PHP5.5+.
 *
 * @author   Jitendra Adhikari <jiten.adhikary@gmail.com>
 * @license  MIT
 *
 * @link     https://github.com/adhocore/jwt
 */
class JWT
{
    use ValidatesJWT;

    const ERROR_KEY_EMPTY        = 10;
    const ERROR_KEY_INVALID      = 12;
    const ERROR_ALGO_UNSUPPORTED = 20;
    const ERROR_ALGO_MISSING     = 22;
    const ERROR_INVALID_MAXAGE   = 30;
    const ERROR_INVALID_LEEWAY   = 32;
    const ERROR_JSON_FAILED      = 40;
    const ERROR_TOKEN_INVALID    = 50;
    const ERROR_TOKEN_EXPIRED    = 52;
    const ERROR_TOKEN_NOT_NOW    = 54;
    const ERROR_SIGNATURE_FAILED = 60;
    const ERROR_KID_UNKNOWN      = 70;

    /** @var array Supported Signing algorithms. */
    protected $algos = [
        'HS256' => 'sha256',
        'HS384' => 'sha384',
        'HS512' => 'sha512',
        'RS256' => \OPENSSL_ALGO_SHA256,
        'RS384' => \OPENSSL_ALGO_SHA384,
        'RS512' => \OPENSSL_ALGO_SHA512,
    ];

    /** @var string|resource The signature key. */
    protected $key;

    /** @var array The list of supported keys with id. */
    protected $keys = [];

    /** @var int|null Use setTestTimestamp() to set custom value for time(). Useful for testability. */
    protected $timestamp = null;

    /** @var string The JWT signing algorithm. Defaults to HS256. */
    protected $algo = 'HS256';

    /** @var int The JWT TTL in seconds. Defaults to 1 hour. */
    protected $maxAge = 3600;

    /** @var int Grace period in seconds to allow for clock skew. Defaults to 0 seconds. */
    protected $leeway = 0;

    /** @var string|null The passphrase for RSA signing (optional). */
    protected $passphrase;

    /**
     * Constructor.
     *
     * @param string|resource $key    The signature key. For RS* it should be file path or resource of private key.
     * @param string          $algo   The algorithm to sign/verify the token.
     * @param int             $maxAge The TTL of token to be used to determine expiry if `iat` claim is present.
     *                                This is also used to provide default `exp` claim in case it is missing.
     * @param int             $leeway Leeway for clock skew. Shouldnot be more than 2 minutes (120s).
     * @param string          $pass   The passphrase (only for RS* algos).
     */
    public function __construct($key, $algo = 'HS256', $maxAge = 3600, $leeway = 0, $pass = null)
    {
        $this->validateConfig($key, $algo, $maxAge, $leeway);

        if (\is_array($key)) {
            $this->registerKeys($key);
            $key = reset($key); // use first one!
        }

        $this->key        = $key;
        $this->algo       = $algo;
        $this->maxAge     = $maxAge;
        $this->leeway     = $leeway;
        $this->passphrase = $pass;
    }

    /**
     * Register keys for `kid` support.
     *
     * @param array $keys Use format: ['<kid>' => '<key data>', '<kid2>' => '<key data2>']
     *
     * @return self
     */
    public function registerKeys(array $keys)
    {
        $this->keys = \array_merge($this->keys, $keys);

        return $this;
    }

    /**
     * Encode payload as JWT token.
     *
     * @param array $payload
     * @param array $header  Extra header (if any) to append.
     *
     * @return string URL safe JWT token.
     */
    public function encode(array $payload, array $header = [])
    {
        $header = ['typ' => 'JWT', 'alg' => $this->algo] + $header;

        $this->validateKid($header);
        $header    = $this->urlSafeEncode($header);
        $payload   = $this->urlSafeEncode($payload);
        $signature = $this->urlSafeEncode($this->sign($header . '.' . $payload));

        return $header . '.' . $payload . '.' . $signature;
    }

    /**
     * Decode JWT token and return original payload.
     *
     * @param string $token
     *
     * @return array
     */
    public function decode($token)
    {
        if (\substr_count($token, '.') < 2) {
            throw new JWTException('Invalid token: Incomplete segments', static::ERROR_TOKEN_INVALID);
        }

        $token = \explode('.', $token, 3);
        $this->validateHeader((array) $this->urlSafeDecode($token[0]));

        // Validate signature.
        if (!$this->verify($token[0] . '.' . $token[1], $token[2])) {
            throw new JWTException('Invalid token: Signature failed', static::ERROR_SIGNATURE_FAILED);
        }

        $payload = (array) $this->urlSafeDecode($token[1]);

        $this->validateTimestamps($payload);

        return $payload;
    }

    /**
     * Spoof current timestamp for testing.
     *
     * @param int|null $timestamp
     */
    public function setTestTimestamp($timestamp = null)
    {
        $this->timestamp = $timestamp;

        return $this;
    }

    /**
     * Sign the input with configured key and return the signature.
     *
     * @param string $input
     *
     * @return string
     */
    protected function sign($input)
    {
        // HMAC SHA.
        if (\substr($this->algo, 0, 2) === 'HS') {
            return \hash_hmac($this->algos[$this->algo], $input, $this->key, true);
        }

        $this->validateKey();

        \openssl_sign($input, $signature, $this->key, $this->algos[$this->algo]);

        return $signature;
    }

    /**
     * Verify the signature of given input.
     *
     * @param string $input
     * @param string $signature
     *
     * @throws JWTException When key is invalid.
     *
     * @return bool
     */
    protected function verify($input, $signature)
    {
        $algo = $this->algos[$this->algo];

        // HMAC SHA.
        if (\substr($this->algo, 0, 2) === 'HS') {
            return \hash_equals($this->urlSafeEncode(\hash_hmac($algo, $input, $this->key, true)), $signature);
        }

        $this->validateKey();

        $pubKey = \openssl_pkey_get_details($this->key)['key'];

        return \openssl_verify($input, $this->urlSafeDecode($signature, false), $pubKey, $algo) === 1;
    }

    /**
     * URL safe base64 encode.
     *
     * First serialized the payload as json if it is an array.
     *
     * @param array|string $data
     *
     * @throws JWTException When JSON encode fails.
     *
     * @return string
     */
    protected function urlSafeEncode($data)
    {
        if (\is_array($data)) {
            $data = \json_encode($data, JSON_UNESCAPED_SLASHES);
            $this->validateLastJson();
        }

        return \rtrim(\strtr(\base64_encode($data), '+/', '-_'), '=');
    }

    /**
     * URL safe base64 decode.
     *
     * @param array|string $data
     * @param bool         $asJson Whether to parse as JSON (defaults to true).
     *
     * @throws JWTException When JSON encode fails.
     *
     * @return array|\stdClass|string
     */
    protected function urlSafeDecode($data, $asJson = true)
    {
        if (!$asJson) {
            return \base64_decode(\strtr($data, '-_', '+/'));
        }

        $data = \json_decode(\base64_decode(\strtr($data, '-_', '+/')));
        $this->validateLastJson();

        return $data;
    }
}
