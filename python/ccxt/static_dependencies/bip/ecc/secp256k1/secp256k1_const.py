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

"""Module with secp256k1 constants."""

# Imports
from typing import Type

from ..common.ikeys import IPrivateKey, IPublicKey
from ..common.ipoint import IPoint


# Variables
Secp256k1Point: Type[IPoint]
Secp256k1PublicKey: Type[IPublicKey]
Secp256k1PrivateKey: Type[IPrivateKey]
_CURVE_ORDER: int
_GENERATOR: IPoint

from ....ecdsa.ecdsa import generator_secp256k1

from ..secp256k1.secp256k1_keys_ecdsa import (
    Secp256k1PointEcdsa, Secp256k1PrivateKeyEcdsa, Secp256k1PublicKeyEcdsa
)

Secp256k1Point = Secp256k1PointEcdsa
Secp256k1PublicKey = Secp256k1PublicKeyEcdsa
Secp256k1PrivateKey = Secp256k1PrivateKeyEcdsa

_CURVE_ORDER = generator_secp256k1.order()
_GENERATOR = Secp256k1Point(generator_secp256k1)


class Secp256k1Const:
    """Class container for Secp256k1 constants."""

    # Curve name
    NAME: str = "Secp256k1"
    # Curve order
    CURVE_ORDER: int = _CURVE_ORDER
    # Curve generator point
    GENERATOR: IPoint = _GENERATOR
