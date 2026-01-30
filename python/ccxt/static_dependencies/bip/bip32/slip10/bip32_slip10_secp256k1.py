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

"""Module for derivation scheme based on secp256k1 curve as defined by BIP32 SLIP-0010."""

# Imports
from typing import Type

from ..base import Bip32Base, IBip32KeyDerivator, IBip32MstKeyGenerator
from ..bip32_const import Bip32Const
from ..bip32_key_net_ver import Bip32KeyNetVersions
from .bip32_slip10_key_derivator import Bip32Slip10EcdsaDerivator
from .bip32_slip10_mst_key_generator import Bip32Slip10Secp256k1MstKeyGenerator
from ...ecc import EllipticCurveTypes


class Bip32Slip10Secp256k1(Bip32Base):
    """
    BIP32 SLIP-0010 secp256k1 v.
    It allows master keys generation and keys derivation using secp256k1 curve.
    """

    @staticmethod
    def CurveType() -> EllipticCurveTypes:
        """
        Return the elliptic curve type.

        Returns:
            EllipticCurveTypes: Curve type
        """
        return EllipticCurveTypes.SECP256K1

    @staticmethod
    def _DefaultKeyNetVersion() -> Bip32KeyNetVersions:
        """
        Return the default key net version.

        Returns:
            Bip32KeyNetVersions object: Bip32KeyNetVersions object
        """
        return Bip32Const.MAIN_NET_KEY_NET_VERSIONS

    @staticmethod
    def _KeyDerivator() -> Type[IBip32KeyDerivator]:
        """
        Return the key derivator class.

        Returns:
            IBip32KeyDerivator class: Key derivator class
        """
        return Bip32Slip10EcdsaDerivator

    @staticmethod
    def _MasterKeyGenerator() -> Type[IBip32MstKeyGenerator]:
        """
        Return the master key generator class.

        Returns:
            IBip32MstKeyGenerator class: Master key generator class
        """
        return Bip32Slip10Secp256k1MstKeyGenerator


# Deprecated: only for compatibility
Bip32Secp256k1 = Bip32Slip10Secp256k1
