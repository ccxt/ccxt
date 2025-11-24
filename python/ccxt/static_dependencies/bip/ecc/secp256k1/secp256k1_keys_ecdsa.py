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

"""Module for secp256k1 keys based on ecdsa library."""

# Imports
from typing import Any

from ....ecdsa import curves, ellipticcurve, keys
from ....ecdsa.ecdsa import curve_secp256k1

from ..common.ikeys import IPrivateKey, IPublicKey
from ..common.ipoint import IPoint
from ..curve.elliptic_curve_types import EllipticCurveTypes
from ..ecdsa.ecdsa_keys import EcdsaKeysConst
from .secp256k1_point_ecdsa import Secp256k1PointEcdsa
from ...utils.misc import DataBytes


class Secp256k1PublicKeyEcdsa(IPublicKey):
    """Secp256k1 public key class."""

    m_ver_key: keys.VerifyingKey

    @classmethod
    def FromBytes(cls,
                  key_bytes: bytes) -> IPublicKey:
        """
        Construct class from key bytes.

        Args:
            key_bytes (bytes): Key bytes

        Returns:
            IPublicKey: IPublicKey object

        Raises:
            ValueError: If key bytes are not valid
        """
        try:
            return cls(keys.VerifyingKey.from_string(key_bytes,
                                                      curve=curves.SECP256k1))
        except keys.MalformedPointError as ex:
            raise ValueError("Invalid public key bytes") from ex

    @classmethod
    def FromPoint(cls,
                  key_point: IPoint) -> IPublicKey:
        """
        Construct class from key point.

        Args:
            key_point (IPoint object): Key point

        Returns:
            IPublicKey: IPublicKey object

        Raises:
            ValueError: If key point is not valid
        """
        try:
            return cls(
                keys.VerifyingKey.from_public_point(
                    ellipticcurve.Point(curve_secp256k1,
                                        key_point.X(),
                                        key_point.Y()),
                    curve=curves.SECP256k1
                )
            )
        except keys.MalformedPointError as ex:
            raise ValueError("Invalid public key point") from ex

    def __init__(self,
                 key_obj: keys.VerifyingKey) -> None:
        """
        Construct class from key object.

        Args:
            key_obj (keys.VerifyingKey): Key object
        """
        self.m_ver_key = key_obj

    @staticmethod
    def CurveType() -> EllipticCurveTypes:
        """
        Get the elliptic curve type.

        Returns:
           EllipticCurveTypes: Elliptic curve type
        """
        return EllipticCurveTypes.SECP256K1

    @staticmethod
    def CompressedLength() -> int:
        """
        Get the compressed key length.

        Returns:
           int: Compressed key length
        """
        return EcdsaKeysConst.PUB_KEY_COMPRESSED_BYTE_LEN

    @staticmethod
    def UncompressedLength() -> int:
        """
        Get the uncompressed key length.

        Returns:
           int: Uncompressed key length
        """
        return EcdsaKeysConst.PUB_KEY_UNCOMPRESSED_BYTE_LEN

    def UnderlyingObject(self) -> Any:
        """
        Get the underlying object.

        Returns:
           Any: Underlying object
        """
        return self.m_ver_key

    def RawCompressed(self) -> DataBytes:
        """
        Return raw compressed public key.

        Returns:
            DataBytes object: DataBytes object
        """
        return DataBytes(self.m_ver_key.to_string('compressed'))

    def RawUncompressed(self) -> DataBytes:
        """
        Return raw uncompressed public key.

        Returns:
            DataBytes object: DataBytes object
        """
        return DataBytes(self.m_ver_key.to_string())

    def Point(self) -> IPoint:
        """
        Get public key point.

        Returns:
            IPoint object: IPoint object
        """
        return Secp256k1PointEcdsa(self.m_ver_key.pubkey.point)


class Secp256k1PrivateKeyEcdsa(IPrivateKey):
    """Secp256k1 private key class."""

    m_sign_key = keys.SigningKey

    @classmethod
    def FromBytes(cls,
                  key_bytes: bytes) -> IPrivateKey:
        """
        Construct class from key bytes.

        Args:
            key_bytes (bytes): Key bytes

        Returns:
            IPrivateKey: IPrivateKey object

        Raises:
            ValueError: If key bytes are not valid
        """
        try:
            return cls(keys.SigningKey.from_string(key_bytes,
                                                    curve=curves.SECP256k1))
        except keys.MalformedPointError as ex:
            raise ValueError("Invalid private key bytes") from ex

    def __init__(self,
                 key_obj: keys.SigningKey) -> None:
        """
        Construct class from key object.

        Args:
            key_obj (ecdsa.SigningKey): Key object
        """
        self.m_sign_key = key_obj

    @staticmethod
    def CurveType() -> EllipticCurveTypes:
        """
        Get the elliptic curve type.

        Returns:
           EllipticCurveTypes: Elliptic curve type
        """
        return EllipticCurveTypes.SECP256K1

    @staticmethod
    def Length() -> int:
        """
        Get the key length.

        Returns:
           int: Key length
        """
        return EcdsaKeysConst.PRIV_KEY_BYTE_LEN

    def UnderlyingObject(self) -> Any:
        """
        Get the underlying object.

        Returns:
           Any: Underlying object
        """
        return self.m_sign_key

    def Raw(self) -> DataBytes:
        """
        Return raw private key.

        Returns:
            DataBytes object: DataBytes object
        """
        return DataBytes(self.m_sign_key.to_string())

    def PublicKey(self) -> IPublicKey:
        """
        Get the public key correspondent to the private one.

        Returns:
            IPublicKey object: IPublicKey object
        """
        return Secp256k1PublicKeyEcdsa(self.m_sign_key.get_verifying_key())
