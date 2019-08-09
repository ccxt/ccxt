
# Fast Elliptic Curve Cryptography in PHP


## Information

This library is a PHP port of [elliptic](https://github.com/indutny/elliptic), a great JavaScript ECC library.

* Supported curve types: Short Weierstrass, Montgomery, Edwards, Twisted Edwards.
* Curve 'presets': `secp256k1`, `p192`, `p224`, `p256`, `p384`, `p521`, `curve25519`, `ed25519`.

This software is licensed under the MIT License.

Projects which use Fast ECC PHP library: [PrivMX WebMail](https://privmx.com), ...


## Benchmarks

```
+------------------------+----------------+--------+-----+------+
| subject                | mode           | rstdev | its | revs |
+------------------------+----------------+--------+-----+------+
| elliptic#genKeyPair    | 323.682ops/s   | 2.72%  | 5   | 50   |
| mdanter#genKeyPair     | 13.794ops/s    | 3.18%  | 5   | 50   |
+------------------------+----------------+--------+-----+------+
| elliptic#sign          | 307.228ops/s   | 3.82%  | 5   | 50   |
| mdanter#sign           | 14.118ops/s    | 2.12%  | 5   | 50   |
+------------------------+----------------+--------+-----+------+
| elliptic#verify        | 93.913ops/s    | 5.93%  | 5   | 50   |
| mdanter#verify         | 6.859ops/s     | 2.95%  | 5   | 50   |
+------------------------+----------------+--------+-----+------+
| elliptic#dh            | 135.166ops/s   | 1.67%  | 5   | 50   |
| mdanter#dh             | 14.302ops/s    | 0.89%  | 5   | 50   |
+------------------------+----------------+--------+-----+------+
| elliptic#EdDSASign     | 296.756ops/s   | 1.09%  | 5   | 50   |
+------------------------+----------------+--------+-----+------+
| elliptic#EdDSAVerify   | 67.481ops/s    | 2.76%  | 5   | 50   |
+------------------------+----------------+--------+-----+------+
```


## Installation

You can install this library via Composer:
```
composer require simplito/elliptic-php
```


## Implementation details

ECDSA is using deterministic `k` value generation as per [RFC6979][0]. Most of
the curve operations are performed on non-affine coordinates (either projective
or extended), various windowing techniques are used for different cases.

NOTE: `curve25519` could not be used for ECDSA, use `ed25519` instead.

All operations are performed in reduction context using [bn-php][1].


## API

### ECDSA

```php
<?php
use Elliptic\EC;

// Create and initialize EC context
// (better do it once and reuse it)
$ec = new EC('secp256k1');

// Generate keys
$key = $ec->genKeyPair();

// Sign message (can be hex sequence or array)
$msg = 'ab4c3451';
$signature = $key->sign($msg);

// Export DER encoded signature to hex string
$derSign = $signature->toDER('hex');

// Verify signature
echo "Verified: " . (($key->verify($msg, $derSign) == TRUE) ? "true" : "false") . "\n";

// CHECK WITH NO PRIVATE KEY

// Public key as '04 + x + y'
$pub = "049a1eedae838f2f8ad94597dc4368899ecc751342b464862da80c280d841875ab4607fb6ce14100e71dd7648dd6b417c7872a6ff1ff29195dabd99f15eff023e5";

// Signature MUST be either:
// 1) hex-string of DER-encoded signature; or
// 2) DER-encoded signature as byte array; or
// 3) object with two hex-string properties (r and s)

// case 1
$sig = '30450220233f8bab3f5df09e3d02f45914b0b519d2c04d13ac6964495623806a015df1cd022100c0c279c989b79885b3cc0f117643317bc59414bfb581f38e03557b8532f06603';

// case 2
$sig = [48,69,2,32,35,63,139,171,63,93,240,158,61,2,244,89,20,176,181,25,210,192,77,19,172,105,100,73,86,35,128,106,1,93,241,205,2,33,0,192,194,121,201,137,183,152,133,179,204,15,17,118,67,49,123,197,148,20,191,181,129,243,142,3,85,123,133,50,240,102,3];

// case 3
$sig = ['r' => '233f8bab3f5df09e3d02f45914b0b519d2c04d13ac6964495623806a015df1cd', 's' => 'c0c279c989b79885b3cc0f117643317bc59414bfb581f38e03557b8532f06603'];


// Import public key
$key = $ec->keyFromPublic($pub, 'hex');

// Verify signature
echo "Verified: " . (($key->verify($msg, $sig) == TRUE) ? "true" : "false") . "\n";
```

### EdDSA

```php
<?php
use Elliptic\EdDSA;

// Create and initialize EdDSA context
// (better do it once and reuse it)
$ec = new EdDSA('ed25519');

// Create key pair from secret
$key = $ec->keyFromSecret('61233ca4590acd'); // hex string or array of bytes

// Sign message (can be hex sequence or array)
$msg = 'ab4c3451';
$signature = $key->sign($msg)->toHex();

// Verify signature
echo "Verified: " . (($key->verify($msg, $signature) == TRUE) ? "true" : "false") . "\n";

// CHECK WITH NO PRIVATE KEY

// Import public key
$pub = '2763d01c334250d3e2dda459e5e3f949f667c6bbf0a35012c77ad40b00f0374d';
$key = $ec->keyFromPublic($pub, 'hex');

// Verify signature
$signature = '93899915C2919181A3D244AAAC032CE78EF76D2FFC0355D4BE2C70F48202EBC5F2BB0541D236182F55B11AC6346B524150695E5DE1FEA570786E1CC1F7999404';
echo "Verified: " . (($key->verify($msg, $signature) == TRUE) ? "true" : "false") . "\n";
```

### ECDH

```php
<?php
use Elliptic\EC;

$ec = new EC('curve25519');

// Generate keys
$key1 = $ec->genKeyPair();
$key2 = $ec->genKeyPair();

$shared1 = $key1->derive($key2->getPublic());
$shared2 = $key2->derive($key1->getPublic());

echo "Both shared secrets are BN instances\n";
echo $shared1->toString(16) . "\n";
echo $shared2->toString(16) . "\n";
```

NOTE: `.derive()` returns a [BN][1] instance.


[0]: http://tools.ietf.org/html/rfc6979
[1]: https://github.com/simplito/bn-php
