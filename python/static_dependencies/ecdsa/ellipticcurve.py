#! /usr/bin/env python
#
# Implementation of elliptic curves, for cryptographic applications.
#
# This module doesn't provide any way to choose a random elliptic
# curve, nor to verify that an elliptic curve was chosen randomly,
# because one can simply use NIST's standard curves.
#
# Notes from X9.62-1998 (draft):
#   Nomenclature:
#     - Q is a public key.
#     The "Elliptic Curve Domain Parameters" include:
#     - q is the "field size", which in our case equals p.
#     - p is a big prime.
#     - G is a point of prime order (5.1.1.1).
#     - n is the order of G (5.1.1.1).
#   Public-key validation (5.2.2):
#     - Verify that Q is not the point at infinity.
#     - Verify that X_Q and Y_Q are in [0,p-1].
#     - Verify that Q is on the curve.
#     - Verify that nQ is the point at infinity.
#   Signature generation (5.3):
#     - Pick random k from [1,n-1].
#   Signature checking (5.4.2):
#     - Verify that r and s are in [1,n-1].
#
# Version of 2008.11.25.
#
# Revision history:
#    2005.12.31 - Initial version.
#    2008.11.25 - Change CurveFp.is_on to contains_point.
#
# Written in 2005 by Peter Pearson and placed in the public domain.

from __future__ import division

from six import python_2_unicode_compatible
from . import numbertheory

@python_2_unicode_compatible
class CurveFp(object):
  """Elliptic Curve over the field of integers modulo a prime."""
  def __init__(self, p, a, b):
    """The curve of points satisfying y^2 = x^3 + a*x + b (mod p)."""
    self.__p = p
    self.__a = a
    self.__b = b

  def p(self):
    return self.__p

  def a(self):
    return self.__a

  def b(self):
    return self.__b

  def contains_point(self, x, y):
    """Is the point (x,y) on this curve?"""
    return (y * y - (x * x * x + self.__a * x + self.__b)) % self.__p == 0

  def __str__(self):
    return "CurveFp(p=%d, a=%d, b=%d)" % (self.__p, self.__a, self.__b)

class Point(object):
  """A point on an elliptic curve. Altering x and y is forbidding,
     but they can be read by the x() and y() methods."""
  def __init__(self, curve, x, y, order=None):
    """curve, x, y, order; order (optional) is the order of this point."""
    self.__curve = curve
    self.__x = x
    self.__y = y
    self.__order = order
    # self.curve is allowed to be None only for INFINITY:
    if self.__curve:
      assert self.__curve.contains_point(x, y)
    if order:
      assert self * order == INFINITY

  def __eq__(self, other):
    """Return True if the points are identical, False otherwise."""
    if self.__curve == other.__curve \
       and self.__x == other.__x \
       and self.__y == other.__y:
      return True
    else:
      return False

  def __add__(self, other):
    """Add one point to another point."""

    # X9.62 B.3:

    if other == INFINITY:
      return self
    if self == INFINITY:
      return other
    assert self.__curve == other.__curve
    if self.__x == other.__x:
      if (self.__y + other.__y) % self.__curve.p() == 0:
        return INFINITY
      else:
        return self.double()

    p = self.__curve.p()

    l = ((other.__y - self.__y) * \
         numbertheory.inverse_mod(other.__x - self.__x, p)) % p

    x3 = (l * l - self.__x - other.__x) % p
    y3 = (l * (self.__x - x3) - self.__y) % p

    return Point(self.__curve, x3, y3)

  def __mul__(self, other):
    """Multiply a point by an integer."""

    def leftmost_bit(x):
      assert x > 0
      result = 1
      while result <= x:
        result = 2 * result
      return result // 2

    e = other
    if self.__order:
      e = e % self.__order
    if e == 0:
      return INFINITY
    if self == INFINITY:
      return INFINITY
    assert e > 0

    # From X9.62 D.3.2:

    e3 = 3 * e
    negative_self = Point(self.__curve, self.__x, -self.__y, self.__order)
    i = leftmost_bit(e3) // 2
    result = self
    # print_("Multiplying %s by %d (e3 = %d):" % (self, other, e3))
    while i > 1:
      result = result.double()
      if (e3 & i) != 0 and (e & i) == 0:
        result = result + self
      if (e3 & i) == 0 and (e & i) != 0:
        result = result + negative_self
      # print_(". . . i = %d, result = %s" % ( i, result ))
      i = i // 2

    return result

  def __rmul__(self, other):
    """Multiply a point by an integer."""

    return self * other

  def __str__(self):
    if self == INFINITY:
      return "infinity"
    return "(%d,%d)" % (self.__x, self.__y)

  def double(self):
    """Return a new point that is twice the old."""

    if self == INFINITY:
      return INFINITY

    # X9.62 B.3:

    p = self.__curve.p()
    a = self.__curve.a()

    l = ((3 * self.__x * self.__x + a) * \
         numbertheory.inverse_mod(2 * self.__y, p)) % p

    x3 = (l * l - 2 * self.__x) % p
    y3 = (l * (self.__x - x3) - self.__y) % p

    return Point(self.__curve, x3, y3)

  def x(self):
    return self.__x

  def y(self):
    return self.__y

  def curve(self):
    return self.__curve

  def order(self):
    return self.__order


# This one point is the Point At Infinity for all purposes:
INFINITY = Point(None, None, None)

