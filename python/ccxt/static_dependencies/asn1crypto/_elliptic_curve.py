# coding: utf-8

"""
Classes and objects to represent prime-field elliptic curves and points on them.
Exports the following items:

 - PrimeCurve()
 - PrimePoint()
 - SECP192R1_CURVE
 - SECP192R1_BASE_POINT
 - SECP224R1_CURVE
 - SECP224R1_BASE_POINT
 - SECP256R1_CURVE
 - SECP256R1_BASE_POINT
 - SECP384R1_CURVE
 - SECP384R1_BASE_POINT
 - SECP521R1_CURVE
 - SECP521R1_BASE_POINT

The curve constants are all PrimeCurve() objects and the base point constants
are all PrimePoint() objects.

Some of the following source code is derived from
http://webpages.charter.net/curryfans/peter/downloads.html, but has been heavily
modified to fit into this projects lint settings. The original project license
is listed below:

Copyright (c) 2014 Peter Pearson

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
"""

from __future__ import unicode_literals, division, absolute_import, print_function

from ._int import inverse_mod


class PrimeCurve():
    """
    Elliptic curve over a prime field. Characteristic two field curves are not
    supported.
    """

    def __init__(self, p, a, b):
        """
        The curve of points satisfying y^2 = x^3 + a*x + b (mod p)

        :param p:
            The prime number as an integer

        :param a:
            The component a as an integer

        :param b:
            The component b as an integer
        """

        self.p = p
        self.a = a
        self.b = b

    def contains(self, point):
        """
        :param point:
            A Point object

        :return:
            Boolean if the point is on this curve
        """

        y2 = point.y * point.y
        x3 = point.x * point.x * point.x
        return (y2 - (x3 + self.a * point.x + self.b)) % self.p == 0


class PrimePoint():
    """
    A point on a prime-field elliptic curve
    """

    def __init__(self, curve, x, y, order=None):
        """
        :param curve:
            A PrimeCurve object

        :param x:
            The x coordinate of the point as an integer

        :param y:
            The y coordinate of the point as an integer

        :param order:
            The order of the point, as an integer - optional
        """

        self.curve = curve
        self.x = x
        self.y = y
        self.order = order

        # self.curve is allowed to be None only for INFINITY:
        if self.curve:
            if not self.curve.contains(self):
                raise ValueError('Invalid EC point')

        if self.order:
            if self * self.order != INFINITY:
                raise ValueError('Invalid EC point')

    def __cmp__(self, other):
        """
        :param other:
            A PrimePoint object

        :return:
            0 if identical, 1 otherwise
        """
        if self.curve == other.curve and self.x == other.x and self.y == other.y:
            return 0
        else:
            return 1

    def __add__(self, other):
        """
        :param other:
            A PrimePoint object

        :return:
            A PrimePoint object
        """

        # X9.62 B.3:

        if other == INFINITY:
            return self
        if self == INFINITY:
            return other
        assert self.curve == other.curve
        if self.x == other.x:
            if (self.y + other.y) % self.curve.p == 0:
                return INFINITY
            else:
                return self.double()

        p = self.curve.p

        l_ = ((other.y - self.y) * inverse_mod(other.x - self.x, p)) % p

        x3 = (l_ * l_ - self.x - other.x) % p
        y3 = (l_ * (self.x - x3) - self.y) % p

        return PrimePoint(self.curve, x3, y3)

    def __mul__(self, other):
        """
        :param other:
            An integer to multiple the Point by

        :return:
            A PrimePoint object
        """

        def leftmost_bit(x):
            assert x > 0
            result = 1
            while result <= x:
                result = 2 * result
            return result // 2

        e = other
        if self.order:
            e = e % self.order
        if e == 0:
            return INFINITY
        if self == INFINITY:
            return INFINITY
        assert e > 0

        # From X9.62 D.3.2:

        e3 = 3 * e
        negative_self = PrimePoint(self.curve, self.x, -self.y, self.order)
        i = leftmost_bit(e3) // 2
        result = self
        # print "Multiplying %s by %d (e3 = %d):" % ( self, other, e3 )
        while i > 1:
            result = result.double()
            if (e3 & i) != 0 and (e & i) == 0:
                result = result + self
            if (e3 & i) == 0 and (e & i) != 0:
                result = result + negative_self
            # print ". . . i = %d, result = %s" % ( i, result )
            i = i // 2

        return result

    def __rmul__(self, other):
        """
        :param other:
            An integer to multiple the Point by

        :return:
            A PrimePoint object
        """

        return self * other

    def double(self):
        """
        :return:
            A PrimePoint object that is twice this point
        """

        # X9.62 B.3:

        p = self.curve.p
        a = self.curve.a

        l_ = ((3 * self.x * self.x + a) * inverse_mod(2 * self.y, p)) % p

        x3 = (l_ * l_ - 2 * self.x) % p
        y3 = (l_ * (self.x - x3) - self.y) % p

        return PrimePoint(self.curve, x3, y3)


# This one point is the Point At Infinity for all purposes:
INFINITY = PrimePoint(None, None, None)


# NIST Curve P-192:
SECP192R1_CURVE = PrimeCurve(
    6277101735386680763835789423207666416083908700390324961279,
    -3,
    0x64210519e59c80e70fa7e9ab72243049feb8deecc146b9b1
)
SECP192R1_BASE_POINT = PrimePoint(
    SECP192R1_CURVE,
    0x188da80eb03090f67cbf20eb43a18800f4ff0afd82ff1012,
    0x07192b95ffc8da78631011ed6b24cdd573f977a11e794811,
    6277101735386680763835789423176059013767194773182842284081
)


# NIST Curve P-224:
SECP224R1_CURVE = PrimeCurve(
    26959946667150639794667015087019630673557916260026308143510066298881,
    -3,
    0xb4050a850c04b3abf54132565044b0b7d7bfd8ba270b39432355ffb4
)
SECP224R1_BASE_POINT = PrimePoint(
    SECP224R1_CURVE,
    0xb70e0cbd6bb4bf7f321390b94a03c1d356c21122343280d6115c1d21,
    0xbd376388b5f723fb4c22dfe6cd4375a05a07476444d5819985007e34,
    26959946667150639794667015087019625940457807714424391721682722368061
)


# NIST Curve P-256:
SECP256R1_CURVE = PrimeCurve(
    115792089210356248762697446949407573530086143415290314195533631308867097853951,
    -3,
    0x5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604b
)
SECP256R1_BASE_POINT = PrimePoint(
    SECP256R1_CURVE,
    0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296,
    0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5,
    115792089210356248762697446949407573529996955224135760342422259061068512044369
)


# NIST Curve P-384:
SECP384R1_CURVE = PrimeCurve(
    39402006196394479212279040100143613805079739270465446667948293404245721771496870329047266088258938001861606973112319,  # noqa
    -3,
    0xb3312fa7e23ee7e4988e056be3f82d19181d9c6efe8141120314088f5013875ac656398d8a2ed19d2a85c8edd3ec2aef
)
SECP384R1_BASE_POINT = PrimePoint(
    SECP384R1_CURVE,
    0xaa87ca22be8b05378eb1c71ef320ad746e1d3b628ba79b9859f741e082542a385502f25dbf55296c3a545e3872760ab7,
    0x3617de4a96262c6f5d9e98bf9292dc29f8f41dbd289a147ce9da3113b5f0b8c00a60b1ce1d7e819d7a431d7c90ea0e5f,
    39402006196394479212279040100143613805079739270465446667946905279627659399113263569398956308152294913554433653942643
)


# NIST Curve P-521:
SECP521R1_CURVE = PrimeCurve(
    6864797660130609714981900799081393217269435300143305409394463459185543183397656052122559640661454554977296311391480858037121987999716643812574028291115057151,  # noqa
    -3,
    0x051953eb9618e1c9a1f929a21a0b68540eea2da725b99b315f3b8b489918ef109e156193951ec7e937b1652c0bd3bb1bf073573df883d2c34f1ef451fd46b503f00  # noqa
)
SECP521R1_BASE_POINT = PrimePoint(
    SECP521R1_CURVE,
    0xc6858e06b70404e9cd9e3ecb662395b4429c648139053fb521f828af606b4d3dbaa14b5e77efe75928fe1dc127a2ffa8de3348b3c1856a429bf97e7e31c2e5bd66,  # noqa
    0x11839296a789a3bc0045c8a5fb42c7d1bd998f54449579b446817afbd17273e662c97ee72995ef42640c550b9013fad0761353c7086a272c24088be94769fd16650,  # noqa
    6864797660130609714981900799081393217269435300143305409394463459185543183397655394245057746333217197532963996371363321113864768612440380340372808892707005449  # noqa
)
