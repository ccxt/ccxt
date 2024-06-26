"""
Those functions were taken from https://github.com/starkware-libs/cairo-lang v0.11.0.2
The reference commit: https://github.com/starkware-libs/cairo-lang/commit/c954f154bbab04c3fb27f7598b015a9475fc628e
"""
import hashlib
import math
from typing import Optional

from ..ecdsa.rfc6979 import generate_k

def _sign(n):
    if n < 0:
        return -1, -n
    return 1, n


def gcdext(a, b):
    if not a or not b:
        g = abs(a) or abs(b)
        if not g:
            return (0, 0, 0)
        return (g, a // g, b // g)

    x_sign, a = _sign(a)
    y_sign, b = _sign(b)
    x, r = 1, 0
    y, s = 0, 1

    while b:
        q, c = divmod(a, b)
        a, b = b, c
        x, r = r, x - q*r
        y, s = s, y - q*s

    return (a, x * x_sign, y * y_sign)
    
def igcdex(a, b):
    """Returns x, y, g such that g = x*a + y*b = gcd(a, b).

    Examples
    ========

    >>> from sympy.core.intfunc import igcdex
    >>> igcdex(2, 3)
    (-1, 1, 1)
    >>> igcdex(10, 12)
    (-1, 1, 2)

    >>> x, y, g = igcdex(100, 2004)
    >>> x, y, g
    (-20, 1, 4)
    >>> x*100 + y*2004
    4

    """
    if (not a) and (not b):
        return (0, 1, 0)
    g, x, y = gcdext(int(a), int(b))
    return x, y, g

EC_ORDER = 0x800000000000010ffffffffffffffffb781126dcae7b2321e66a241adc64d2f


def cpp_div_mod(n: int, m: int, p: int) -> int:
    """
    Finds a nonnegative integer 0 <= x < p such that (m * x) % p == n
    """
    a, b, c = igcdex(m, p)
    assert c == 1
    return (n * a) % p


def cpp_inv_mod_curve_size(x: int) -> int:
    return cpp_div_mod(1, x, EC_ORDER)


def cpp_generate_k_rfc6979(
    msg_hash: int, priv_key: int, seed: Optional[int] = None
) -> int:
    # Pad the message hash, for consistency with the elliptic.js library.
    if 1 <= msg_hash.bit_length() % 8 <= 4 and msg_hash.bit_length() >= 248:
        # Only if we are one-nibble short:
        msg_hash *= 16

    if seed is None:
        extra_entropy = b""
    else:
        extra_entropy = seed.to_bytes(math.ceil(seed.bit_length() / 8), "big")

    return generate_k(
        EC_ORDER,
        priv_key,
        hashlib.sha256,
        msg_hash.to_bytes(math.ceil(msg_hash.bit_length() / 8), "big"),
        extra_entropy=extra_entropy,
    )
