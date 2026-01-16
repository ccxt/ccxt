# Copyright (c) 2022 Emanuele Bellocchia
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

"""
Module for BIP32 Khovratovich/Law keys derivation.
Reference: https://github.com/LedgerHQ/orakolo/blob/master/papers/Ed25519_BIP%20Final.pdf
"""

# Imports
from .bip32_ex import Bip32KeyError
from .bip32_key_data import Bip32KeyIndex
from .bip32_keys import Bip32PublicKey
from .kholaw.bip32_kholaw_key_derivator_base import Bip32KholawEd25519KeyDerivatorBase
from bip_utils.ecc import Ed25519KholawPrivateKey, EllipticCurve, IPoint
from ..utils.misc import BytesUtils, IntegerUtils


class Bip32KholawEd25519KeyDerivator(Bip32KholawEd25519KeyDerivatorBase):
    """
    BIP32 Khovratovich/Law ed25519 key derivator class.
    It allows keys derivation for ed25519 curves in according to BIP32 Khovratovich/Law.
    """

    @staticmethod
    def _SerializeIndex(index: Bip32KeyIndex) -> bytes:
        """
        Serialize key index.

        Args:
            index (Bip32KeyIndex object): Key index

        Returns:
            bytes: Serialized index
        """
        return index.ToBytes(endianness="little")

    @staticmethod
    def _NewPrivateKeyLeftPart(zl_bytes: bytes,
                               kl_bytes: bytes,
                               curve: EllipticCurve) -> bytes:
        """
        Compute the new private key left part for private derivation.

        Args:
            zl_bytes (bytes)            : Leftmost Z 32-byte
            kl_bytes (bytes)            : Leftmost private key 32-byte
            curve (EllipticCurve object): EllipticCurve object

        Returns:
            bytes: Leftmost new private key 32-byte
        """
        zl_int = BytesUtils.ToInteger(zl_bytes[:28], endianness="little")
        kl_int = BytesUtils.ToInteger(kl_bytes, endianness="little")

        prvl_int = (zl_int * 8) + kl_int
        # Discard child if multiple of curve order
        if prvl_int % curve.Order() == 0:
            raise Bip32KeyError("Computed child key is not valid, very unlucky index")

        return IntegerUtils.ToBytes(prvl_int,
                                    bytes_num=Ed25519KholawPrivateKey.Length() // 2,
                                    endianness="little")

    @staticmethod
    def _NewPrivateKeyRightPart(zr_bytes: bytes,
                                kr_bytes: bytes) -> bytes:
        """
        Compute the new private key right part for private derivation.

        Args:
            zr_bytes (bytes): Rightmost Z 32-byte
            kr_bytes (bytes): Rightmost private key 32-byte

        Returns:
            bytes: Rightmost new private key 32-byte
        """
        zr_int = BytesUtils.ToInteger(zr_bytes, endianness="little")
        kpr_int = BytesUtils.ToInteger(kr_bytes, endianness="little")
        kr_int = (zr_int + kpr_int) % (2 ** 256)

        return IntegerUtils.ToBytes(kr_int,
                                    bytes_num=Ed25519KholawPrivateKey.Length() // 2,
                                    endianness="little")

    @staticmethod
    def _NewPublicKeyPoint(pub_key: Bip32PublicKey,
                           zl_bytes: bytes) -> IPoint:
        """
        Compute new public key point for public derivation.

        Args:
            pub_key (Bip32PublicKey object): Bip32PublicKey object
            zl_bytes (bytes)               : Leftmost Z 32-byte

        Returns:
            IPoint object: IPoint object
        """

        # Compute the new public key point: PKEY + 8ZL * G
        zl_int = BytesUtils.ToInteger(zl_bytes[:28], endianness="little")
        return pub_key.Point() + ((zl_int * 8) * pub_key.Curve().Generator())
