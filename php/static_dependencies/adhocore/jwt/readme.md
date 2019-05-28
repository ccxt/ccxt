## adhocore/jwt

[![Latest Version](https://img.shields.io/github/release/adhocore/jwt.svg?style=flat-square)](https://github.com/adhocore/jwt/releases)
[![Travis Build](https://img.shields.io/travis/adhocore/jwt/master.svg?style=flat-square)](https://travis-ci.org/adhocore/jwt?branch=master)
[![Scrutinizer CI](https://img.shields.io/scrutinizer/g/adhocore/jwt.svg?style=flat-square)](https://scrutinizer-ci.com/g/adhocore/jwt/?branch=master)
[![Codecov branch](https://img.shields.io/codecov/c/github/adhocore/jwt/master.svg?style=flat-square)](https://codecov.io/gh/adhocore/jwt)
[![StyleCI](https://styleci.io/repos/88168137/shield)](https://styleci.io/repos/88168137)
[![Software License](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](LICENSE)


- Lightweight JSON Web Token (JWT) library for PHP5.5 or newer.

## Installation
```
composer require adhocore/jwt
```

## Usage
```php
use Ahc\Jwt\JWT;

// Instantiate with key, algo, maxAge and leeway.
$jwt = new JWT('secret', 'HS256', 3600, 10);

// Only the key is required. Defaults will be used for the rest:
// algo = HS256, maxAge = 3600, leeway = 0
$jwt = new JWT('secret');

// For RS* algo, the key should be either a resource like below:
$key = openssl_pkey_new(['digest_alg' => 'sha256', 'private_key_bits' => 1024, 'private_key_type' => OPENSSL_KEYTYPE_RSA]);
// OR, a string with full path to the RSA private key like below:
$key = '/path/to/rsa.key';
// Then, instantiate JWT with this key and RS* as algo:
$jwt = new JWT($key, 'RS384');

// Generate JWT token from payload array.
$token = $jwt->encode([
    'uid'    => 1,
    'aud'    => 'http://site.com',
    'scopes' => ['user'],
    'iss'    => 'http://api.mysite.com',
]);

// Retrieve the payload array.
$payload = $jwt->decode($token);

// Oneliner.
$token   = (new JWT('topSecret', 'HS512', 1800))->encode(['uid' => 1, 'scopes' => ['user']]));
$payload = (new JWT('topSecret', 'HS512', 1800))->decode($token);

// Can pass extra headers into encode() with second parameter.
$token = $jwt->encode($payload, ['hdr' => 'hdr_value']);

// Spoof time() for testing token expiry.
$jwt->setTestTimestamp(time() + 10000);
// Throws Exception.
$jwt->parse($token);

// Call again without parameter to stop spoofing time().
$jwt->setTestTimestamp();

```

## Features

- Six algorithms supported:
```
'HS256', 'HS384', 'HS512', 'RS256', 'RS384', 'RS512'
```
- Leeway support 0-120 seconds.
- Timestamp spoofing for tests.
- Passphrase support for `RS*` algos.

### Integration

#### Phalcon

Check [adhocore/phalcon-ext](https://github.com/adhocore/phalcon-ext).

#### Laravel/Lumen

Check [tymondesign/jwt-auth](https://github.com/tymondesigns/jwt-auth).

### Consideration

Be aware of some security related considerations as outlined [here](http://cryto.net/~joepie91/blog/2016/06/13/stop-using-jwt-for-sessions/) which can be valid for any JWT implementations.

