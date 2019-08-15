#! /usr/bin/env python

"""
Implementation of Elliptic-Curve Digital Signatures.

Classes and methods for elliptic-curve signatures:
private keys, public keys, signatures,
NIST prime-modulus curves with modulus lengths of
192, 224, 256, 384, and 521 bits.

Example:

  # (In real-life applications, you would probably want to
  # protect against defects in SystemRandom.)
  from random import SystemRandom
  randrange = SystemRandom().randrange

  # Generate a public/private key pair using the NIST Curve P-192:

  g = generator_192
  n = g.order()
  secret = randrange( 1, n )
  pubkey = Public_key( g, g * secret )
  privkey = Private_key( pubkey, secret )

  # Signing a hash value:

  hash = randrange( 1, n )
  signature = privkey.sign( hash, randrange( 1, n ) )

  # Verifying a signature for a hash value:

  if pubkey.verifies( hash, signature ):
    print_("Demo verification succeeded.")
  else:
    print_("*** Demo verification failed.")

  # Verification fails if the hash value is modified:

  if pubkey.verifies( hash-1, signature ):
    print_("**** Demo verification failed to reject tampered hash.")
  else:
    print_("Demo verification correctly rejected tampered hash.")

Version of 2009.05.16.

Revision history:
      2005.12.31 - Initial version.
      2008.11.25 - Substantial revisions introducing new classes.
      2009.05.16 - Warn against using random.randrange in real applications.
      2009.05.17 - Use random.SystemRandom by default.

Written in 2005 by Peter Pearson and placed in the public domain.
"""

from six import int2byte, b
from . import ellipticcurve
from . import numbertheory


class RSZeroError(RuntimeError):
    pass


class Signature(object):
  """ECDSA signature.
  """
  def __init__(self, r, s):
    self.r = r
    self.s = s

  def recover_public_keys(self, hash, generator):
    """Returns two public keys for which the signature is valid
    hash is signed hash
    generator is the used generator of the signature
    """
    curve = generator.curve()
    n = generator.order()
    r = self.r
    s = self.s
    e = hash
    x = r

    # Compute the curve point with x as x-coordinate
    alpha = (pow(x, 3, curve.p()) + (curve.a() * x) + curve.b()) % curve.p()
    beta = numbertheory.square_root_mod_prime(alpha, curve.p())
    y = beta if beta % 2 == 0 else curve.p() - beta

    # Compute the public key
    R1 = ellipticcurve.Point(curve, x, y, n)
    Q1 = numbertheory.inverse_mod(r, n) * (s * R1 + (-e % n) * generator)
    Pk1 = Public_key(generator, Q1)

    # And the second solution
    R2 = ellipticcurve.Point(curve, x, -y, n)
    Q2 = numbertheory.inverse_mod(r, n) * (s * R2 + (-e % n) * generator)
    Pk2 = Public_key(generator, Q2)

    return [Pk1, Pk2]

class Public_key(object):
  """Public key for ECDSA.
  """

  def __init__(self, generator, point):
    """generator is the Point that generates the group,
    point is the Point that defines the public key.
    """

    self.curve = generator.curve()
    self.generator = generator
    self.point = point
    n = generator.order()
    if not n:
      raise RuntimeError("Generator point must have order.")
    if not n * point == ellipticcurve.INFINITY:
      raise RuntimeError("Generator point order is bad.")
    if point.x() < 0 or n <= point.x() or point.y() < 0 or n <= point.y():
      raise RuntimeError("Generator point has x or y out of range.")

  def verifies(self, hash, signature):
    """Verify that signature is a valid signature of hash.
    Return True if the signature is valid.
    """

    # From X9.62 J.3.1.

    G = self.generator
    n = G.order()
    r = signature.r
    s = signature.s
    if r < 1 or r > n - 1:
      return False
    if s < 1 or s > n - 1:
      return False
    c = numbertheory.inverse_mod(s, n)
    u1 = (hash * c) % n
    u2 = (r * c) % n
    xy = u1 * G + u2 * self.point
    v = xy.x() % n
    return v == r


class Private_key(object):
  """Private key for ECDSA.
  """

  def __init__(self, public_key, secret_multiplier):
    """public_key is of class Public_key;
    secret_multiplier is a large integer.
    """

    self.public_key = public_key
    self.secret_multiplier = secret_multiplier

  def sign(self, hash, random_k):
    """Return a signature for the provided hash, using the provided
    random nonce.  It is absolutely vital that random_k be an unpredictable
    number in the range [1, self.public_key.point.order()-1].  If
    an attacker can guess random_k, he can compute our private key from a
    single signature.  Also, if an attacker knows a few high-order
    bits (or a few low-order bits) of random_k, he can compute our private
    key from many signatures.  The generation of nonces with adequate
    cryptographic strength is very difficult and far beyond the scope
    of this comment.

    May raise RuntimeError, in which case retrying with a new
    random value k is in order.
    """

    G = self.public_key.generator
    n = G.order()
    k = random_k % n
    p1 = k * G
    r = p1.x() % n
    if r == 0:
      raise RSZeroError("amazingly unlucky random number r")
    s = (numbertheory.inverse_mod(k, n) *
         (hash + (self.secret_multiplier * r) % n)) % n
    if s == 0:
      raise RSZeroError("amazingly unlucky random number s")
    return Signature(r, s)


def int_to_string(x):
  """Convert integer x into a string of bytes, as per X9.62."""
  assert x >= 0
  if x == 0:
    return b('\0')
  result = []
  while x:
    ordinal = x & 0xFF
    result.append(int2byte(ordinal))
    x >>= 8

  result.reverse()
  return b('').join(result)


def string_to_int(s):
  """Convert a string of bytes into an integer, as per X9.62."""
  result = 0
  for c in s:
    if not isinstance(c, int):
      c = ord(c)
    result = 256 * result + c
  return result


def digest_integer(m):
  """Convert an integer into a string of bytes, compute
     its SHA-1 hash, and convert the result to an integer."""
  #
  # I don't expect this function to be used much. I wrote
  # it in order to be able to duplicate the examples
  # in ECDSAVS.
  #
  from hashlib import sha1
  return string_to_int(sha1(int_to_string(m)).digest())


def point_is_valid(generator, x, y):
  """Is (x,y) a valid public key based on the specified generator?"""

  # These are the tests specified in X9.62.

  n = generator.order()
  curve = generator.curve()
  if x < 0 or n <= x or y < 0 or n <= y:
    return False
  if not curve.contains_point(x, y):
    return False
  if not n * ellipticcurve.Point(curve, x, y) == ellipticcurve.INFINITY:
    return False
  return True


# NIST Curve P-192:
_p = 6277101735386680763835789423207666416083908700390324961279
_r = 6277101735386680763835789423176059013767194773182842284081
# s = 0x3045ae6fc8422f64ed579528d38120eae12196d5L
# c = 0x3099d2bbbfcb2538542dcd5fb078b6ef5f3d6fe2c745de65L
_b = 0x64210519e59c80e70fa7e9ab72243049feb8deecc146b9b1
_Gx = 0x188da80eb03090f67cbf20eb43a18800f4ff0afd82ff1012
_Gy = 0x07192b95ffc8da78631011ed6b24cdd573f977a11e794811

curve_192 = ellipticcurve.CurveFp(_p, -3, _b)
generator_192 = ellipticcurve.Point(curve_192, _Gx, _Gy, _r)


# NIST Curve P-224:
_p = 26959946667150639794667015087019630673557916260026308143510066298881
_r = 26959946667150639794667015087019625940457807714424391721682722368061
# s = 0xbd71344799d5c7fcdc45b59fa3b9ab8f6a948bc5L
# c = 0x5b056c7e11dd68f40469ee7f3c7a7d74f7d121116506d031218291fbL
_b = 0xb4050a850c04b3abf54132565044b0b7d7bfd8ba270b39432355ffb4
_Gx = 0xb70e0cbd6bb4bf7f321390b94a03c1d356c21122343280d6115c1d21
_Gy = 0xbd376388b5f723fb4c22dfe6cd4375a05a07476444d5819985007e34

curve_224 = ellipticcurve.CurveFp(_p, -3, _b)
generator_224 = ellipticcurve.Point(curve_224, _Gx, _Gy, _r)

# NIST Curve P-256:
_p = 115792089210356248762697446949407573530086143415290314195533631308867097853951
_r = 115792089210356248762697446949407573529996955224135760342422259061068512044369
# s = 0xc49d360886e704936a6678e1139d26b7819f7e90L
# c = 0x7efba1662985be9403cb055c75d4f7e0ce8d84a9c5114abcaf3177680104fa0dL
_b = 0x5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604b
_Gx = 0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296
_Gy = 0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5

curve_256 = ellipticcurve.CurveFp(_p, -3, _b)
generator_256 = ellipticcurve.Point(curve_256, _Gx, _Gy, _r)

# NIST Curve P-384:
_p = 39402006196394479212279040100143613805079739270465446667948293404245721771496870329047266088258938001861606973112319
_r = 39402006196394479212279040100143613805079739270465446667946905279627659399113263569398956308152294913554433653942643
# s = 0xa335926aa319a27a1d00896a6773a4827acdac73L
# c = 0x79d1e655f868f02fff48dcdee14151ddb80643c1406d0ca10dfe6fc52009540a495e8042ea5f744f6e184667cc722483L
_b = 0xb3312fa7e23ee7e4988e056be3f82d19181d9c6efe8141120314088f5013875ac656398d8a2ed19d2a85c8edd3ec2aef
_Gx = 0xaa87ca22be8b05378eb1c71ef320ad746e1d3b628ba79b9859f741e082542a385502f25dbf55296c3a545e3872760ab7
_Gy = 0x3617de4a96262c6f5d9e98bf9292dc29f8f41dbd289a147ce9da3113b5f0b8c00a60b1ce1d7e819d7a431d7c90ea0e5f

curve_384 = ellipticcurve.CurveFp(_p, -3, _b)
generator_384 = ellipticcurve.Point(curve_384, _Gx, _Gy, _r)

# NIST Curve P-521:
_p = 6864797660130609714981900799081393217269435300143305409394463459185543183397656052122559640661454554977296311391480858037121987999716643812574028291115057151
_r = 6864797660130609714981900799081393217269435300143305409394463459185543183397655394245057746333217197532963996371363321113864768612440380340372808892707005449
# s = 0xd09e8800291cb85396cc6717393284aaa0da64baL
# c = 0x0b48bfa5f420a34949539d2bdfc264eeeeb077688e44fbf0ad8f6d0edb37bd6b533281000518e19f1b9ffbe0fe9ed8a3c2200b8f875e523868c70c1e5bf55bad637L
_b = 0x051953eb9618e1c9a1f929a21a0b68540eea2da725b99b315f3b8b489918ef109e156193951ec7e937b1652c0bd3bb1bf073573df883d2c34f1ef451fd46b503f00
_Gx = 0xc6858e06b70404e9cd9e3ecb662395b4429c648139053fb521f828af606b4d3dbaa14b5e77efe75928fe1dc127a2ffa8de3348b3c1856a429bf97e7e31c2e5bd66
_Gy = 0x11839296a789a3bc0045c8a5fb42c7d1bd998f54449579b446817afbd17273e662c97ee72995ef42640c550b9013fad0761353c7086a272c24088be94769fd16650

curve_521 = ellipticcurve.CurveFp(_p, -3, _b)
generator_521 = ellipticcurve.Point(curve_521, _Gx, _Gy, _r)

# Certicom secp256-k1
_a = 0x0000000000000000000000000000000000000000000000000000000000000000
_b = 0x0000000000000000000000000000000000000000000000000000000000000007
_p = 0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f
_Gx = 0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798
_Gy = 0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8
_r = 0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141

curve_secp256k1 = ellipticcurve.CurveFp(_p, _a, _b)
generator_secp256k1 = ellipticcurve.Point(curve_secp256k1, _Gx, _Gy, _r)
