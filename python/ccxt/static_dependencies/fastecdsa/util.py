from binascii import hexlify
import hmac
from struct import pack
from typing import Callable


class RFC6979:
    """Generate a nonce per RFC6979.

    In order to avoid reusing a nonce with the same key when signing two different messages (which
    leaks the private key) RFC6979 provides a deterministic method for generating nonces. This is
    based on using a pseudo-random function (HMAC) to derive a nonce from the message and private
    key. More info here: http://tools.ietf.org/html/rfc6979.

    Attributes:
        |  msg (bytes): A message being signed.
        |  x (int): An ECDSA private key.
        |  q (int): The order of the generator point of the curve being used to sign the message.
        |  hashfunc (_hashlib.HASH): The hash function used to compress the message.
        |  prehashed (bool): Whether the signature is on a pre-hashed message.
    """
    def __init__(self, msg: bytes, x: int, q: int, hashfunc: Callable, prehashed: bool = False):
        self.x = x
        self.q = q
        self.msg = msg_bytes(msg)
        self.qlen = len(bin(q)) - 2  # -2 for the leading '0b'
        self.rlen = ((self.qlen + 7) // 8) * 8
        self.hashfunc = hashfunc
        self.prehashed = prehashed

    def _bits2int(self, b: bytes) -> int:
        """ http://tools.ietf.org/html/rfc6979#section-2.3.2 """
        i = int(hexlify(b), 16)
        blen = len(b) * 8

        if blen > self.qlen:
            i >>= (blen - self.qlen)

        return i

    def _int2octets(self, x: int) -> bytes:
        """ http://tools.ietf.org/html/rfc6979#section-2.3.3 """
        octets = b''

        while x > 0:
            octets = pack('=B', (0xff & x)) + octets
            x >>= 8

        padding = b'\x00' * ((self.rlen // 8) - len(octets))
        return padding + octets

    def _bits2octets(self, b: bytes) -> bytes:
        """ http://tools.ietf.org/html/rfc6979#section-2.3.4 """
        z1 = self._bits2int(b)  # -2 for the leading '0b'
        z2 = z1 % self.q
        return self._int2octets(z2)

    def gen_nonce(self):
        """ http://tools.ietf.org/html/rfc6979#section-3.2 """
        hash_size = self.hashfunc().digest_size
        if self.prehashed:
            h1 = self.msg
        else:
            h1 = self.hashfunc(self.msg).digest()
        key_and_msg = self._int2octets(self.x) + self._bits2octets(h1)

        v = b''.join([b'\x01' for _ in range(hash_size)])
        k = b''.join([b'\x00' for _ in range(hash_size)])

        k = hmac.new(k, v + b'\x00' + key_and_msg, self.hashfunc).digest()
        v = hmac.new(k, v, self.hashfunc).digest()
        k = hmac.new(k, v + b'\x01' + key_and_msg, self.hashfunc).digest()
        v = hmac.new(k, v, self.hashfunc).digest()

        while True:
            t = b''

            while len(t) * 8 < self.qlen:
                v = hmac.new(k, v, self.hashfunc).digest()
                t = t + v

            nonce = self._bits2int(t)
            if nonce >= 1 and nonce < self.q:
                return nonce

            k = hmac.new(k, v + b'\x00', self.hashfunc).digest()
            v = hmac.new(k, v, self.hashfunc).digest()


def _tonelli_shanks(n: int, p: int) -> (int, int):
    """A generic algorithm for computing modular square roots."""
    Q, S = p - 1, 0
    while Q % 2 == 0:
        Q, S = Q // 2, S + 1

    z = 2
    while pow(z, (p - 1) // 2, p) != (-1 % p):
        z += 1

    M, c, t, R = S, pow(z, Q, p), pow(n, Q, p), pow(n, (Q + 1) // 2, p)
    while t != 1:
        for i in range(1, M):
            if pow(t, 2**i, p) == 1:
                break

        b = pow(c, 2**(M - i - 1), p)
        M, c, t, R = i, pow(b, 2, p), (t * b * b) % p, (R * b) % p

    return R, -R % p


def mod_sqrt(a: int, p: int) -> (int, int):
    r"""Compute the square root of :math:`a \pmod{p}`

    In other words, find a value :math:`x` such that :math:`x^2 \equiv a \pmod{p}`.

    Args:
        |  a (int): The value whose root to take.
        |  p (int): The prime whose field to perform the square root in.

    Returns:
        (int, int): the two values of :math:`x` satisfying :math:`x^2 \equiv a \pmod{p}`.
    """
    if p % 4 == 3:
        k = (p - 3) // 4
        x = pow(a, k + 1, p)
        return x, (-x % p)
    else:
        return _tonelli_shanks(a, p)


def msg_bytes(msg) -> bytes:
    """Return bytes in a consistent way for a given message.

    The message is expected to be either a string, bytes, or an array of bytes.

    Args:
        |  msg (str|bytes|bytearray): The data to transform.

    Returns:
        bytes: The byte encoded data.

    Raises:
        ValueError: If the data cannot be encoded as bytes.
    """
    if isinstance(msg, bytes):
        return msg
    elif isinstance(msg, str):
        return msg.encode()
    elif isinstance(msg, bytearray):
        return bytes(msg)
    else:
        raise ValueError('Msg "{}" of type {} cannot be converted to bytes'.format(
            msg, type(msg)))


def validate_type(instance: object, expected_type: type):
    """Validate that instance is an instance of the expected_type.

    Args:
        |  instance: The object whose type is being checked
        |  expected_type: The expected type of instance
        |  var_name: The name of the object

    Raises:
         TypeError: If instance is not of type expected_type
    """
    if not isinstance(instance, expected_type):
        raise TypeError('Expected a value of type {}, got a value of type {}'.format(
            expected_type, type(instance)))
