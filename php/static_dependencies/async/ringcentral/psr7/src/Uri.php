<?php
namespace RingCentral\Psr7;

use Psr\Http\Message\UriInterface;

/**
 * Basic PSR-7 URI implementation.
 *
 * @link https://github.com/phly/http This class is based upon
 *     Matthew Weier O'Phinney's URI implementation in phly/http.
 */
class Uri implements UriInterface
{
    private static $schemes = array(
        'http'  => 80,
        'https' => 443,
    );

    private static $charUnreserved = 'a-zA-Z0-9_\-\.~';
    private static $charSubDelims = '!\$&\'\(\)\*\+,;=';
    private static $replaceQuery = array('=' => '%3D', '&' => '%26');

    /** @var string Uri scheme. */
    private $scheme = '';

    /** @var string Uri user info. */
    private $userInfo = '';

    /** @var string Uri host. */
    private $host = '';

    /** @var int|null Uri port. */
    private $port;

    /** @var string Uri path. */
    private $path = '';

    /** @var string Uri query string. */
    private $query = '';

    /** @var string Uri fragment. */
    private $fragment = '';

    /**
     * @param string $uri URI to parse and wrap.
     */
    public function __construct($uri = '')
    {
        if ($uri != null) {
            $parts = parse_url($uri);
            if ($parts === false) {
                throw new \InvalidArgumentException("Unable to parse URI: $uri");
            }
            $this->applyParts($parts);
        }
    }

    public function __toString()
    {
        return self::createUriString(
            $this->scheme,
            $this->getAuthority(),
            $this->getPath(),
            $this->query,
            $this->fragment
        );
    }

    /**
     * Removes dot segments from a path and returns the new path.
     *
     * @param string $path
     *
     * @return string
     * @link http://tools.ietf.org/html/rfc3986#section-5.2.4
     */
    public static function removeDotSegments($path)
    {
        static $noopPaths = array('' => true, '/' => true, '*' => true);
        static $ignoreSegments = array('.' => true, '..' => true);

        if (isset($noopPaths[$path])) {
            return $path;
        }

        $results = array();
        $segments = explode('/', $path);
        foreach ($segments as $segment) {
            if ($segment == '..') {
                array_pop($results);
            } elseif (!isset($ignoreSegments[$segment])) {
                $results[] = $segment;
            }
        }

        $newPath = implode('/', $results);
        // Add the leading slash if necessary
        if (substr($path, 0, 1) === '/' &&
            substr($newPath, 0, 1) !== '/'
        ) {
            $newPath = '/' . $newPath;
        }

        // Add the trailing slash if necessary
        if ($newPath != '/' && isset($ignoreSegments[end($segments)])) {
            $newPath .= '/';
        }

        return $newPath;
    }

    /**
     * Resolve a base URI with a relative URI and return a new URI.
     *
     * @param UriInterface $base Base URI
     * @param string       $rel  Relative URI
     *
     * @return UriInterface
     */
    public static function resolve(UriInterface $base, $rel)
    {
        if ($rel === null || $rel === '') {
            return $base;
        }

        if (!($rel instanceof UriInterface)) {
            $rel = new self($rel);
        }

        // Return the relative uri as-is if it has a scheme.
        if ($rel->getScheme()) {
            return $rel->withPath(static::removeDotSegments($rel->getPath()));
        }

        $relParts = array(
            'scheme'    => $rel->getScheme(),
            'authority' => $rel->getAuthority(),
            'path'      => $rel->getPath(),
            'query'     => $rel->getQuery(),
            'fragment'  => $rel->getFragment()
        );

        $parts = array(
            'scheme'    => $base->getScheme(),
            'authority' => $base->getAuthority(),
            'path'      => $base->getPath(),
            'query'     => $base->getQuery(),
            'fragment'  => $base->getFragment()
        );

        if (!empty($relParts['authority'])) {
            $parts['authority'] = $relParts['authority'];
            $parts['path'] = self::removeDotSegments($relParts['path']);
            $parts['query'] = $relParts['query'];
            $parts['fragment'] = $relParts['fragment'];
        } elseif (!empty($relParts['path'])) {
            if (substr($relParts['path'], 0, 1) == '/') {
                $parts['path'] = self::removeDotSegments($relParts['path']);
                $parts['query'] = $relParts['query'];
                $parts['fragment'] = $relParts['fragment'];
            } else {
                if (!empty($parts['authority']) && empty($parts['path'])) {
                    $mergedPath = '/';
                } else {
                    $mergedPath = substr($parts['path'], 0, strrpos($parts['path'], '/') + 1);
                }
                $parts['path'] = self::removeDotSegments($mergedPath . $relParts['path']);
                $parts['query'] = $relParts['query'];
                $parts['fragment'] = $relParts['fragment'];
            }
        } elseif (!empty($relParts['query'])) {
            $parts['query'] = $relParts['query'];
        } elseif ($relParts['fragment'] != null) {
            $parts['fragment'] = $relParts['fragment'];
        }

        return new self(static::createUriString(
            $parts['scheme'],
            $parts['authority'],
            $parts['path'],
            $parts['query'],
            $parts['fragment']
        ));
    }

    /**
     * Create a new URI with a specific query string value removed.
     *
     * Any existing query string values that exactly match the provided key are
     * removed.
     *
     * Note: this function will convert "=" to "%3D" and "&" to "%26".
     *
     * @param UriInterface $uri URI to use as a base.
     * @param string       $key Query string key value pair to remove.
     *
     * @return UriInterface
     */
    public static function withoutQueryValue(UriInterface $uri, $key)
    {
        $current = $uri->getQuery();
        if (!$current) {
            return $uri;
        }

        $result = array();
        foreach (explode('&', $current) as $part) {
            $subParts = explode('=', $part);
            if ($subParts[0] !== $key) {
                $result[] = $part;
            };
        }

        return $uri->withQuery(implode('&', $result));
    }

    /**
     * Create a new URI with a specific query string value.
     *
     * Any existing query string values that exactly match the provided key are
     * removed and replaced with the given key value pair.
     *
     * Note: this function will convert "=" to "%3D" and "&" to "%26".
     *
     * @param UriInterface $uri URI to use as a base.
     * @param string $key   Key to set.
     * @param string $value Value to set.
     *
     * @return UriInterface
     */
    public static function withQueryValue(UriInterface $uri, $key, $value)
    {
        $current = $uri->getQuery();
        $key = strtr($key, self::$replaceQuery);

        if (!$current) {
            $result = array();
        } else {
            $result = array();
            foreach (explode('&', $current) as $part) {
                $subParts = explode('=', $part);
                if ($subParts[0] !== $key) {
                    $result[] = $part;
                };
            }
        }

        if ($value !== null) {
            $result[] = $key . '=' . strtr($value, self::$replaceQuery);
        } else {
            $result[] = $key;
        }

        return $uri->withQuery(implode('&', $result));
    }

    /**
     * Create a URI from a hash of parse_url parts.
     *
     * @param array $parts
     *
     * @return self
     */
    public static function fromParts(array $parts)
    {
        $uri = new self();
        $uri->applyParts($parts);
        return $uri;
    }

    public function getScheme()
    {
        return $this->scheme;
    }

    public function getAuthority()
    {
        if (empty($this->host)) {
            return '';
        }

        $authority = $this->host;
        if (!empty($this->userInfo)) {
            $authority = $this->userInfo . '@' . $authority;
        }

        if ($this->isNonStandardPort($this->scheme, $this->host, $this->port)) {
            $authority .= ':' . $this->port;
        }

        return $authority;
    }

    public function getUserInfo()
    {
        return $this->userInfo;
    }

    public function getHost()
    {
        return $this->host;
    }

    public function getPort()
    {
        return $this->port;
    }

    public function getPath()
    {
        return $this->path == null ? '' : $this->path;
    }

    public function getQuery()
    {
        return $this->query;
    }

    public function getFragment()
    {
        return $this->fragment;
    }

    public function withScheme($scheme)
    {
        $scheme = $this->filterScheme($scheme);

        if ($this->scheme === $scheme) {
            return $this;
        }

        $new = clone $this;
        $new->scheme = $scheme;
        $new->port = $new->filterPort($new->scheme, $new->host, $new->port);
        return $new;
    }

    public function withUserInfo($user, $password = null)
    {
        $info = $user;
        if ($password) {
            $info .= ':' . $password;
        }

        if ($this->userInfo === $info) {
            return $this;
        }

        $new = clone $this;
        $new->userInfo = $info;
        return $new;
    }

    public function withHost($host)
    {
        if ($this->host === $host) {
            return $this;
        }

        $new = clone $this;
        $new->host = $host;
        return $new;
    }

    public function withPort($port)
    {
        $port = $this->filterPort($this->scheme, $this->host, $port);

        if ($this->port === $port) {
            return $this;
        }

        $new = clone $this;
        $new->port = $port;
        return $new;
    }

    public function withPath($path)
    {
        if (!is_string($path)) {
            throw new \InvalidArgumentException(
                'Invalid path provided; must be a string'
            );
        }

        $path = $this->filterPath($path);

        if ($this->path === $path) {
            return $this;
        }

        $new = clone $this;
        $new->path = $path;
        return $new;
    }

    public function withQuery($query)
    {
        if (!is_string($query) && !method_exists($query, '__toString')) {
            throw new \InvalidArgumentException(
                'Query string must be a string'
            );
        }

        $query = (string) $query;
        if (substr($query, 0, 1) === '?') {
            $query = substr($query, 1);
        }

        $query = $this->filterQueryAndFragment($query);

        if ($this->query === $query) {
            return $this;
        }

        $new = clone $this;
        $new->query = $query;
        return $new;
    }

    public function withFragment($fragment)
    {
        if (substr($fragment, 0, 1) === '#') {
            $fragment = substr($fragment, 1);
        }

        $fragment = $this->filterQueryAndFragment($fragment);

        if ($this->fragment === $fragment) {
            return $this;
        }

        $new = clone $this;
        $new->fragment = $fragment;
        return $new;
    }

    /**
     * Apply parse_url parts to a URI.
     *
     * @param $parts Array of parse_url parts to apply.
     */
    private function applyParts(array $parts)
    {
        $this->scheme = isset($parts['scheme'])
            ? $this->filterScheme($parts['scheme'])
            : '';
        $this->userInfo = isset($parts['user']) ? $parts['user'] : '';
        $this->host = isset($parts['host']) ? $parts['host'] : '';
        $this->port = !empty($parts['port'])
            ? $this->filterPort($this->scheme, $this->host, $parts['port'])
            : null;
        $this->path = isset($parts['path'])
            ? $this->filterPath($parts['path'])
            : '';
        $this->query = isset($parts['query'])
            ? $this->filterQueryAndFragment($parts['query'])
            : '';
        $this->fragment = isset($parts['fragment'])
            ? $this->filterQueryAndFragment($parts['fragment'])
            : '';
        if (isset($parts['pass'])) {
            $this->userInfo .= ':' . $parts['pass'];
        }
    }

    /**
     * Create a URI string from its various parts
     *
     * @param string $scheme
     * @param string $authority
     * @param string $path
     * @param string $query
     * @param string $fragment
     * @return string
     */
    private static function createUriString($scheme, $authority, $path, $query, $fragment)
    {
        $uri = '';

        if (!empty($scheme)) {
            $uri .= $scheme . '://';
        }

        if (!empty($authority)) {
            $uri .= $authority;
        }

        if ($path != null) {
            // Add a leading slash if necessary.
            if ($uri && substr($path, 0, 1) !== '/') {
                $uri .= '/';
            }
            $uri .= $path;
        }

        if ($query != null) {
            $uri .= '?' . $query;
        }

        if ($fragment != null) {
            $uri .= '#' . $fragment;
        }

        return $uri;
    }

    /**
     * Is a given port non-standard for the current scheme?
     *
     * @param string $scheme
     * @param string $host
     * @param int $port
     * @return bool
     */
    private static function isNonStandardPort($scheme, $host, $port)
    {
        if (!$scheme && $port) {
            return true;
        }

        if (!$host || !$port) {
            return false;
        }

        return !isset(static::$schemes[$scheme]) || $port !== static::$schemes[$scheme];
    }

    /**
     * @param string $scheme
     *
     * @return string
     */
    private function filterScheme($scheme)
    {
        $scheme = strtolower($scheme);
        $scheme = rtrim($scheme, ':/');

        return $scheme;
    }

    /**
     * @param string $scheme
     * @param string $host
     * @param int $port
     *
     * @return int|null
     *
     * @throws \InvalidArgumentException If the port is invalid.
     */
    private function filterPort($scheme, $host, $port)
    {
        if (null !== $port) {
            $port = (int) $port;
            if (1 > $port || 0xffff < $port) {
                throw new \InvalidArgumentException(
                    sprintf('Invalid port: %d. Must be between 1 and 65535', $port)
                );
            }
        }

        return $this->isNonStandardPort($scheme, $host, $port) ? $port : null;
    }

    /**
     * Filters the path of a URI
     *
     * @param $path
     *
     * @return string
     */
    private function filterPath($path)
    {
        return preg_replace_callback(
            '/(?:[^' . self::$charUnreserved . self::$charSubDelims . ':@\/%]+|%(?![A-Fa-f0-9]{2}))/',
            array($this, 'rawurlencodeMatchZero'),
            $path
        );
    }

    /**
     * Filters the query string or fragment of a URI.
     *
     * @param $str
     *
     * @return string
     */
    private function filterQueryAndFragment($str)
    {
        return preg_replace_callback(
            '/(?:[^' . self::$charUnreserved . self::$charSubDelims . '%:@\/\?]+|%(?![A-Fa-f0-9]{2}))/',
            array($this, 'rawurlencodeMatchZero'),
            $str
        );
    }

    private function rawurlencodeMatchZero(array $match)
    {
        return rawurlencode($match[0]);
    }
}
