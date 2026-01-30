# Copyright (c) 2021 Emanuele Bellocchia
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
# THE SOFTWARE.

"""Module with secp256k1 curve."""

# Imports
from ..curve.elliptic_curve import EllipticCurve
from .secp256k1_const import (
    Secp256k1Const, Secp256k1Point, Secp256k1PrivateKey, Secp256k1PublicKey
)


# Secp256k1 curve definition
Secp256k1: EllipticCurve = EllipticCurve(Secp256k1Const.NAME,
                                         Secp256k1Const.CURVE_ORDER,
                                         Secp256k1Const.GENERATOR,
                                         Secp256k1Point,
                                         Secp256k1PublicKey,
                                         Secp256k1PrivateKey)
