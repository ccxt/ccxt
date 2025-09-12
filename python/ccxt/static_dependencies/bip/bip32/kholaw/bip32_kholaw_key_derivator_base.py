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
Module for BIP32 Khovratovich/Law keys derivation (base).
Reference: https://github.com/LedgerHQ/orakolo/blob/master/papers/Ed25519_BIP%20Final.pdf
"""

# Imports
from abc import ABC, abstractmethod
from typing import Tuple, Union

from .base import IBip32KeyDerivator
from .bip32_ex import Bip32KeyError
from .bip32_key_data import Bip32KeyIndex
from .bip32_keys import Bip32PrivateKey, Bip32PublicKey
from bip_utils.ecc import EllipticCurve, IPoint
from ..utils.crypto import HmacSha512


class Bip32KholawEd25519KeyDerivatorBase(IBip32KeyDerivator, ABC):
    """
    BIP32 Khovratovich/Law ed25519 key derivator base class.
    It allows keys derivation for ed25519 curves in according to BIP32 Khovratovich/Law.
    It shall be inherited by child classes to customize the derivation algorithm.
    """

    @staticmethod
    def IsPublicDerivationSupported() -> bool:
        """
        Get if public derivation is supported.

        Returns:
            bool: True if supported, false otherwise.
        """
        return True

    @classmethod
    def CkdPriv(cls,
                priv_key: Bip32PrivateKey,
                pub_key: Bip32PublicKey,
                index: Bip32KeyIndex) -> Tuple[bytes, bytes]:
        """
        Derive a child key with the specified index using private derivation.

        Args:
            priv_key (Bip32PrivateKey object): Bip32PrivateKey object
            pub_key (Bip32PublicKey object)  : Bip32PublicKey object
            index (Bip32KeyIndex object)     : Key index

        Returns:
            tuple[bytes, bytes]: Private key bytes (index 0) and chain code bytes (index 1)

        Raises:
            Bip32KeyError: If the index results in an invalid key
        """

        # Get index and key bytes
        index_bytes = cls._SerializeIndex(index)
        chain_code_bytes = priv_key.ChainCode().ToBytes()
        priv_key_bytes = priv_key.Raw().ToBytes()
        pub_key_bytes = pub_key.RawCompressed().ToBytes()[1:]

        # Compute Z and chain code
        if index.IsHardened():
            z_bytes = HmacSha512.QuickDigest(chain_code_bytes,
                                             b"\x00" + priv_key_bytes + index_bytes)
            chain_code_bytes = HmacSha512.QuickDigestHalves(chain_code_bytes,
                                                            b"\x01" + priv_key_bytes + index_bytes)[1]
        else:
            z_bytes = HmacSha512.QuickDigest(chain_code_bytes,
                                             b"\x02" + pub_key_bytes + index_bytes)
            chain_code_bytes = HmacSha512.QuickDigestHalves(chain_code_bytes,
                                                            b"\x03" + pub_key_bytes + index_bytes)[1]

        # Compute the left and right part of the new private key
        hmac_half_len = HmacSha512.DigestSize() // 2
        kl_bytes = cls._NewPrivateKeyLeftPart(z_bytes[:hmac_half_len],
                                              priv_key_bytes[:hmac_half_len],
                                              pub_key.Curve())
        kr_bytes = cls._NewPrivateKeyRightPart(z_bytes[hmac_half_len:],
                                               priv_key_bytes[hmac_half_len:])

        return kl_bytes + kr_bytes, chain_code_bytes

    @classmethod
    def CkdPub(cls,
               pub_key: Bip32PublicKey,
               index: Bip32KeyIndex) -> Tuple[Union[bytes, IPoint], bytes]:
        """
        Derive a child key with the specified index using public derivation.

        Args:
            pub_key (Bip32PublicKey object): Bip32PublicKey object
            index (Bip32KeyIndex object)   : Key index

        Returns:
            tuple[bytes or IPoint, bytes]: Public key bytes or point (index 0) and chain code bytes (index 1)

        Raises:
            Bip32KeyError: If the index results in an invalid key
        """

        # Get index and key bytes
        index_bytes = cls._SerializeIndex(index)
        chain_code_bytes = pub_key.ChainCode().ToBytes()
        pub_key_bytes = pub_key.RawCompressed().ToBytes()[1:]

        # Compute Z and chain code
        z_bytes = HmacSha512.QuickDigest(chain_code_bytes,
                                         b"\x02" + pub_key_bytes + index_bytes)
        chain_code_bytes = HmacSha512.QuickDigestHalves(chain_code_bytes,
                                                        b"\x03" + pub_key_bytes + index_bytes)[1]

        # Compute the new public key point
        hmac_half_len = HmacSha512.DigestSize() // 2
        new_pub_key_point = cls._NewPublicKeyPoint(pub_key,
                                                   z_bytes[:hmac_half_len])
        # If the public key is the identity point (0, 1) discard the child
        if new_pub_key_point.X() == 0 and new_pub_key_point.Y() == 1:
            raise Bip32KeyError("Computed public child key is not valid, very unlucky index")

        return new_pub_key_point, chain_code_bytes

    #
    # Abstract methods
    #

    @staticmethod
    @abstractmethod
    def _SerializeIndex(index: Bip32KeyIndex) -> bytes:
        """
        Serialize key index.

        Args:
            index (Bip32KeyIndex object): Key index

        Returns:
            bytes: Serialized index
        """

    @staticmethod
    @abstractmethod
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

    @staticmethod
    @abstractmethod
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

    @staticmethod
    @abstractmethod
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
