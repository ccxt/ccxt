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

"""Module for BIP32 SLIP-0010 keys derivation."""

# Imports
from abc import ABC, abstractmethod
from typing import Tuple, Union

from ..bip32_key_data import Bip32KeyIndex
from ..bip32_keys import Bip32PrivateKey, Bip32PublicKey
from ...ecc import IPoint


class IBip32KeyDerivator(ABC):
    """Interface for generic BIP32 key derivator."""

    @staticmethod
    @abstractmethod
    def IsPublicDerivationSupported() -> bool:
        """
        Get if public derivation is supported.

        Returns:
            bool: True if supported, false otherwise.
        """

    @classmethod
    @abstractmethod
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

    @classmethod
    @abstractmethod
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
