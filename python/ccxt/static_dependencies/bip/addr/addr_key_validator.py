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

"""Module with utility functions for validating address public keys."""

# Imports
from typing import Type, Union

from ..ecc import (
    Secp256k1PublicKey, IPublicKey,
    # Ed25519Blake2bPublicKey, Ed25519MoneroPublicKey, Ed25519PublicKey, EllipticCurveGetter,
    # Nist256p1PublicKey, Secp256k1PublicKey, Sr25519PublicKey
)


class AddrKeyValidator:
    """Class container for address utility functions."""

    # @staticmethod
    # def ValidateAndGetEd25519Key(pub_key: Union[bytes, IPublicKey]) -> IPublicKey:
    #     """
    #     Validate and get a ed25519 public key.

    #     Args:
    #         pub_key (bytes or IPublicKey object): Public key bytes or object

    #     Returns:
    #         IPublicKey object: IPublicKey object

    #     Raises:
    #         TypeError: If the public key is not ed25519
    #         ValueError: If the public key is not valid
    #     """
    #     return AddrKeyValidator.__ValidateAndGetGenericKey(pub_key, Ed25519PublicKey)

    # @staticmethod
    # def ValidateAndGetEd25519Blake2bKey(pub_key: Union[bytes, IPublicKey]) -> IPublicKey:
    #     """
    #     Validate and get a ed25519-blake2b public key.

    #     Args:
    #         pub_key (bytes or IPublicKey object): Public key bytes or object

    #     Returns:
    #         IPublicKey object: IPublicKey object

    #     Raises:
    #         TypeError: If the public key is not ed25519-blake2b
    #         ValueError: If the public key is not valid
    #     """
    #     return AddrKeyValidator.__ValidateAndGetGenericKey(pub_key, Ed25519Blake2bPublicKey)

    # @staticmethod
    # def ValidateAndGetEd25519MoneroKey(pub_key: Union[bytes, IPublicKey]) -> IPublicKey:
    #     """
    #     Validate and get a ed25519-monero public key.

    #     Args:
    #         pub_key (bytes or IPublicKey object): Public key bytes or object

    #     Returns:
    #         IPublicKey object: IPublicKey object

    #     Raises:
    #         TypeError: If the public key is not ed25519-monero
    #         ValueError: If the public key is not valid
    #     """
    #     return AddrKeyValidator.__ValidateAndGetGenericKey(pub_key, Ed25519MoneroPublicKey)

    # @staticmethod
    # def ValidateAndGetNist256p1Key(pub_key: Union[bytes, IPublicKey]) -> IPublicKey:
    #     """
    #     Validate and get a nist256p1 public key.

    #     Args:
    #         pub_key (bytes or IPublicKey object): Public key bytes or object

    #     Returns:
    #         IPublicKey object: IPublicKey object

    #     Raises:
    #         TypeError: If the public key is not nist256p1
    #         ValueError: If the public key is not valid
    #     """
    #     return AddrKeyValidator.__ValidateAndGetGenericKey(pub_key, Nist256p1PublicKey)

    @staticmethod
    def ValidateAndGetSecp256k1Key(pub_key: Union[bytes, IPublicKey]) -> IPublicKey:
        """
        Validate and get a secp256k1 public key.

        Args:
            pub_key (bytes or IPublicKey object): Public key bytes or object

        Returns:
            IPublicKey object: IPublicKey object

        Raises:
            TypeError: If the public key is not secp256k1
            ValueError: If the public key is not valid
        """
        return AddrKeyValidator.__ValidateAndGetGenericKey(pub_key, Secp256k1PublicKey)

    # @staticmethod
    # def ValidateAndGetSr25519Key(pub_key: Union[bytes, IPublicKey]) -> IPublicKey:
    #     """
    #     Validate and get a sr25519 public key.

    #     Args:
    #         pub_key (bytes or IPublicKey object): Public key bytes or object

    #     Returns:
    #         IPublicKey object: IPublicKey object

    #     Raises:
    #         TypeError: If the public key is not sr25519
    #         ValueError: If the public key is not valid
    #     """
    #     return AddrKeyValidator.__ValidateAndGetGenericKey(pub_key, Sr25519PublicKey)

    @staticmethod
    def __ValidateAndGetGenericKey(pub_key: Union[bytes, IPublicKey],
                                   pub_key_cls: Type[IPublicKey]) -> IPublicKey:
        """
        Validate and get a generic public key.

        Args:
            pub_key (bytes or IPublicKey object): Public key bytes or object
            pub_key_cls (IPublicKey)            : Public key class type

        Returns:
            IPublicKey object: IPublicKey object

        Raises:
            TypeError: If the public key is not of the correct class type
            ValueError: If the public key is not valid
        """
        if isinstance(pub_key, bytes):
            pub_key = pub_key_cls.FromBytes(pub_key)
        elif not isinstance(pub_key, pub_key_cls):
            curve = EllipticCurveGetter.FromType(pub_key_cls.CurveType())
            raise TypeError(f"A {curve.Name()} public key is required"
                            f"(expected: {pub_key_cls}, got: {type(pub_key)}")

        return pub_key
