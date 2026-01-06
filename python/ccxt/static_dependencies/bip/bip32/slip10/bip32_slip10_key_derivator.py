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

"""
Module for BIP32 SLIP-0010 keys derivation.

References:
    https://github.com/satoshilabs/slips/blob/master/slip-0010.md
    https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki
"""

# Imports
from typing import Tuple, Union

from ..base import IBip32KeyDerivator
from ..bip32_ex import Bip32KeyError
from ..bip32_key_data import Bip32KeyIndex
from ..bip32_keys import Bip32PrivateKey, Bip32PublicKey
from ...ecc import IPoint
from ...utils.crypto import HmacSha512
from ...utils.misc import BytesUtils, IntegerUtils


class Bip32Slip10DerivatorConst:
    """Class container for BIP32 SLIP-0010 derivator constants."""

    # Private key prefix
    PRIV_KEY_PREFIX: bytes = b"\x00"


class Bip32Slip10EcdsaDerivator(IBip32KeyDerivator):
    """
    BIP32 SLIP-0010 ECDSA key derivator class.
    It allows keys derivation for ECDSA curves in according to BIP32 SLIP-0010.
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
        curve = pub_key.Curve()
        priv_key_bytes = priv_key.Raw().ToBytes()

        # Data for HMAC
        if index.IsHardened():
            data_bytes = (Bip32Slip10DerivatorConst.PRIV_KEY_PREFIX
                          + priv_key_bytes
                          + index.ToBytes())
        else:
            data_bytes = pub_key.RawCompressed().ToBytes() + index.ToBytes()

        # Compute HMAC halves
        il_bytes, ir_bytes = HmacSha512.QuickDigestHalves(priv_key.ChainCode().ToBytes(),
                                                          data_bytes)

        # Construct new key secret from iL and current private key
        il_int = BytesUtils.ToInteger(il_bytes)
        priv_key_int = BytesUtils.ToInteger(priv_key_bytes)
        new_priv_key_bytes = IntegerUtils.ToBytes((il_int + priv_key_int) % curve.Order(),
                                                  bytes_num=curve.PrivateKeyClass().Length())

        return new_priv_key_bytes, ir_bytes

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
        # Data for HMAC, same of CkdPriv() for public child key
        data_bytes = pub_key.RawCompressed().ToBytes() + index.ToBytes()

        # Get HMAC of data
        il_bytes, ir_bytes = HmacSha512.QuickDigestHalves(pub_key.ChainCode().ToBytes(),
                                                          data_bytes)
        il_int = BytesUtils.ToInteger(il_bytes)

        # Get a new public key point: pub_key_point + G*iL
        new_pub_key_point = pub_key.Point() + (pub_key.Curve().Generator() * il_int)

        return new_pub_key_point, ir_bytes


class Bip32Slip10Ed25519Derivator(IBip32KeyDerivator):
    """
    BIP32 SLIP-0010 ed25519 key derivator class.
    It allows keys derivation for ed25519 curves in according to BIP32 SLIP-0010.
    """

    @staticmethod
    def IsPublicDerivationSupported() -> bool:
        """
        Get if public derivation is supported.

        Returns:
            bool: True if supported, false otherwise.
        """
        return False

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
        if not index.IsHardened():
            raise Bip32KeyError("Private child derivation with not-hardened index is not supported")

        # Data for HMAC
        data_bytes = (Bip32Slip10DerivatorConst.PRIV_KEY_PREFIX
                      + priv_key.Raw().ToBytes()
                      + index.ToBytes())
        # Compute HMAC halves
        return HmacSha512.QuickDigestHalves(priv_key.ChainCode().ToBytes(),
                                            data_bytes)

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
        raise Bip32KeyError("Public child derivation is not supported")
