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

"""Module for derivation scheme based on ed25519-blake2b curve as defined by BIP32 SLIP-0010."""

# Imports
from .slip10.bip32_slip10_ed25519 import Bip32Slip10Ed25519
from bip_utils.ecc import EllipticCurveTypes


class Bip32Slip10Ed25519Blake2b(Bip32Slip10Ed25519):
    """
    BIP32 SLIP-0010 ed25519-blake2b class.
    It allows master keys generation and keys derivation using ed25519-blake2b curve.
    """

    @staticmethod
    def CurveType() -> EllipticCurveTypes:
        """
        Return the elliptic curve type.

        Returns:
            EllipticCurveTypes: Curve type
        """
        return EllipticCurveTypes.ED25519_BLAKE2B


# Deprecated: only for compatibility
Bip32Ed25519Blake2bSlip = Bip32Slip10Ed25519Blake2b
