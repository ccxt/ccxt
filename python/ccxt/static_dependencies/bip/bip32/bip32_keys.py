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

"""Module for BIP32 keys handling."""

# Imports
from __future__ import annotations

from abc import ABC, abstractmethod
from functools import lru_cache
from typing import Union

from .bip32_ex import Bip32KeyError
from .bip32_key_data import Bip32ChainCode, Bip32FingerPrint, Bip32KeyData
from .bip32_key_net_ver import Bip32KeyNetVersions
from .bip32_key_ser import Bip32PrivateKeySerializer, Bip32PublicKeySerializer
from ..ecc import EllipticCurve, EllipticCurveGetter, EllipticCurveTypes, IPoint, IPrivateKey, IPublicKey
from ..utils.crypto import Hash160
from ..utils.misc import DataBytes


class _Bip32KeyBase(ABC):
    """Base class for a generic BIP32 key."""

    m_curve: EllipticCurve
    m_curve_type: EllipticCurveTypes
    m_key_data: Bip32KeyData
    m_key_net_ver: Bip32KeyNetVersions

    def __init__(self,
                 key_data: Bip32KeyData,
                 key_net_ver: Bip32KeyNetVersions,
                 curve_type: EllipticCurveTypes) -> None:
        """
        Construct class.

        Args:
            key_data (Bip32KeyData object)          : Key data
            key_net_ver (Bip32KeyNetVersions object): Key net versions
            curve_type (EllipticCurveTypes)         : Elliptic curve type
        """
        self.m_curve = EllipticCurveGetter.FromType(curve_type)
        self.m_curve_type = curve_type
        self.m_key_data = key_data
        self.m_key_net_ver = key_net_ver

    def Curve(self) -> EllipticCurve:
        """
        Return key elliptic curve.

        Returns:
            EllipticCurve object: EllipticCurve object
        """
        return self.m_curve

    def CurveType(self) -> EllipticCurveTypes:
        """
        Return key elliptic curve type.

        Returns:
            EllipticCurveTypes: Elliptic curve type
        """
        return self.m_curve_type

    def Data(self) -> Bip32KeyData:
        """
        Return key data.

        Returns:
            BipKeyData object: BipKeyData object
        """
        return self.m_key_data

    def ChainCode(self) -> Bip32ChainCode:
        """
        Return the chain code.

        Returns:
            Bip32ChainCode object: Bip32ChainCode object
        """
        return self.Data().ChainCode()

    def KeyNetVersions(self) -> Bip32KeyNetVersions:
        """
        Get key net versions.

        Returns:
            Bip32KeyNetVersions object: Bip32KeyNetVersions object
        """
        return self.m_key_net_ver

    @abstractmethod
    def ToExtended(self) -> str:
        """
        Return key in serialized extended format.

        Returns:
            str: Key in serialized extended format
        """


class Bip32PublicKey(_Bip32KeyBase):
    """
    BIP32 public key class.
    It represents a public key used by BIP32 with all the related data (e.g. depth, chain code, etc...).
    """

    m_pub_key: IPublicKey

    @classmethod
    def FromBytesOrKeyObject(cls,
                             pub_key: Union[bytes, IPoint, IPublicKey],
                             key_data: Bip32KeyData,
                             key_net_ver: Bip32KeyNetVersions,
                             curve_type: EllipticCurveTypes) -> Bip32PublicKey:
        """
        Get the public key from key bytes or object.

        Args:
            pub_key (bytes, IPoint or IPublicKey)   : Public key
            key_data (Bip32KeyData object)          : Key data
            key_net_ver (Bip32KeyNetVersions object): Key net versions
            curve_type (EllipticCurveTypes)         : Elliptic curve type

        Returns:
            Bip32PublicKey object: Bip32PublicKey object

        Raises:
            Bip32KeyError: If the key constructed from the bytes is not valid
        """
        if isinstance(pub_key, bytes):
            return cls.FromBytes(pub_key, key_data, key_net_ver, curve_type)
        if isinstance(pub_key, IPoint):
            return cls.FromPoint(pub_key, key_data, key_net_ver)
        return cls(pub_key, key_data, key_net_ver)

    @classmethod
    def FromBytes(cls,
                  key_bytes: bytes,
                  key_data: Bip32KeyData,
                  key_net_ver: Bip32KeyNetVersions,
                  curve_type: EllipticCurveTypes) -> Bip32PublicKey:
        """
        Create from bytes.

        Args:
            key_bytes (bytes)                       : Key bytes
            key_data (Bip32KeyData object)          : Key data
            key_net_ver (Bip32KeyNetVersions object): Key net versions
            curve_type (EllipticCurveTypes)         : Elliptic curve type

        Raises:
            Bip32KeyError: If the key constructed from the bytes is not valid
        """
        return cls(cls.__KeyFromBytes(key_bytes, curve_type),
                   key_data,
                   key_net_ver)

    @classmethod
    def FromPoint(cls,
                  key_point: IPoint,
                  key_data: Bip32KeyData,
                  key_net_ver: Bip32KeyNetVersions) -> Bip32PublicKey:
        """
        Create from point.

        Args:
            key_point (IPoint object)               : Key point
            key_data (Bip32KeyData object)          : Key data
            key_net_ver (Bip32KeyNetVersions object): Key net versions

        Raises:
            Bip32KeyError: If the key constructed from the bytes is not valid
        """
        return cls(cls.__KeyFromPoint(key_point),
                   key_data,
                   key_net_ver)

    def __init__(self,
                 pub_key: IPublicKey,
                 key_data: Bip32KeyData,
                 key_net_ver: Bip32KeyNetVersions) -> None:
        """
        Construct class.

        Args:
            pub_key (IPublicKey object)             : Key object
            key_data (Bip32KeyData object)          : Key data
            key_net_ver (Bip32KeyNetVersions object): Key net versions
        """
        super().__init__(key_data, key_net_ver, pub_key.CurveType())
        self.m_pub_key = pub_key

    def KeyObject(self) -> IPublicKey:
        """
        Return the key object.

        Returns:
            IPublicKey object: Key object
        """
        return self.m_pub_key

    @lru_cache()
    def RawCompressed(self) -> DataBytes:
        """
        Return raw compressed public key.

        Returns:
            DataBytes object: DataBytes object
        """
        return self.m_pub_key.RawCompressed()

    @lru_cache()
    def RawUncompressed(self) -> DataBytes:
        """
        Return raw uncompressed public key.

        Returns:
            DataBytes object: DataBytes object
        """
        return self.m_pub_key.RawUncompressed()

    def Point(self) -> IPoint:
        """
        Get public key point.

        Returns:
            IPoint object: IPoint object
        """
        return self.m_pub_key.Point()

    @lru_cache()
    def FingerPrint(self) -> Bip32FingerPrint:
        """
        Get key fingerprint.

        Returns:
            bytes: Key fingerprint bytes
        """
        return Bip32FingerPrint(self.KeyIdentifier())

    @lru_cache()
    def KeyIdentifier(self) -> bytes:
        """
        Get key identifier.

        Returns:
            bytes: Key identifier bytes
        """
        return Hash160.QuickDigest(self.m_pub_key.RawCompressed().ToBytes())

    @lru_cache()
    def ToExtended(self) -> str:
        """
        Return key in serialized extended format.

        Returns:
            str: Key in serialized extended format
        """
        return Bip32PublicKeySerializer.Serialize(self.m_pub_key,
                                                  self.m_key_data,
                                                  self.m_key_net_ver)

    @staticmethod
    def __KeyFromBytes(key_bytes: bytes,
                       curve_type: EllipticCurveTypes) -> IPublicKey:
        """
        Construct key from bytes.

        Args:
            key_bytes (bytes)              : Key bytes
            curve_type (EllipticCurveTypes): Elliptic curve type

        Returns:
            IPublicKey object: IPublicKey object

        Raises:
            Bip32KeyError: If the key constructed from the bytes is not valid
        """
        try:
            curve = EllipticCurveGetter.FromType(curve_type)
            return curve.PublicKeyClass().FromBytes(key_bytes)
        except ValueError as ex:
            raise Bip32KeyError("Invalid public key bytes") from ex

    @staticmethod
    def __KeyFromPoint(key_point: IPoint) -> IPublicKey:
        """
        Construct key from point.

        Args:
            key_point (IPoint object): Key point

        Returns:
            IPublicKey object: IPublicKey object

        Raises:
            Bip32KeyError: If the key constructed from the bytes is not valid
        """
        try:
            curve = EllipticCurveGetter.FromType(key_point.CurveType())
            return curve.PublicKeyClass().FromPoint(key_point)
        except ValueError as ex:
            raise Bip32KeyError("Invalid public key point") from ex


class Bip32PrivateKey(_Bip32KeyBase):
    """
    BIP32 private key class.
    It represents a private key used by BIP32 with all the related data (e.g. depth, chain code, etc...).
    """

    m_priv_key: IPrivateKey

    @classmethod
    def FromBytesOrKeyObject(cls,
                             priv_key: Union[bytes, IPrivateKey],
                             key_data: Bip32KeyData,
                             key_net_ver: Bip32KeyNetVersions,
                             curve_type: EllipticCurveTypes) -> Bip32PrivateKey:
        """
        Get the public key from key bytes or object.

        Args:
            priv_key (bytes or IPrivateKey)         : Private key
            key_data (Bip32KeyData object)          : Key data
            key_net_ver (Bip32KeyNetVersions object): Key net versions
            curve_type (EllipticCurveTypes)         : Elliptic curve type

        Returns:
            Bip32PrivateKey object: Bip32PrivateKey object

        Raises:
            Bip32KeyError: If the key constructed from the bytes is not valid
        """
        return (cls.FromBytes(priv_key, key_data, key_net_ver, curve_type)
                if isinstance(priv_key, bytes)
                else cls(priv_key, key_data, key_net_ver))

    @classmethod
    def FromBytes(cls,
                  key_bytes: bytes,
                  key_data: Bip32KeyData,
                  key_net_ver: Bip32KeyNetVersions,
                  curve_type: EllipticCurveTypes) -> Bip32PrivateKey:
        """
        Create from bytes.

        Args:
            key_bytes (bytes)                       : Key bytes
            key_data (Bip32KeyData object)          : Key data
            key_net_ver (Bip32KeyNetVersions object): Key net versions
            curve_type (EllipticCurveTypes)         : Elliptic curve type

        Raises:
            Bip32KeyError: If the key constructed from the bytes is not valid
        """
        return cls(cls.__KeyFromBytes(key_bytes, curve_type),
                   key_data,
                   key_net_ver)

    def __init__(self,
                 priv_key: IPrivateKey,
                 key_data: Bip32KeyData,
                 key_net_ver: Bip32KeyNetVersions) -> None:
        """
        Construct class.

        Args:
            priv_key (IPrivateKey object)           : Key object
            key_data (Bip32KeyData object)          : Key data
            key_net_ver (Bip32KeyNetVersions object): Key net versions
        """
        super().__init__(key_data, key_net_ver, priv_key.CurveType())
        self.m_priv_key = priv_key

    def KeyObject(self) -> IPrivateKey:
        """
        Return the key object.

        Returns:
            IPrivateKey object: Key object
        """
        return self.m_priv_key

    @lru_cache()
    def Raw(self) -> DataBytes:
        """
        Return raw private key.

        Returns:
            DataBytes object: DataBytes object
        """
        return self.m_priv_key.Raw()

    @lru_cache()
    def PublicKey(self) -> Bip32PublicKey:
        """
        Get the public key correspondent to the private one.

        Returns:
            Bip32PublicKey object: Bip32PublicKey object
        """
        return Bip32PublicKey(self.m_priv_key.PublicKey(),
                              self.m_key_data,
                              self.m_key_net_ver)

    @lru_cache()
    def ToExtended(self) -> str:
        """
        Return key in serialized extended format.

        Returns:
            str: Key in serialized extended format
        """
        return Bip32PrivateKeySerializer.Serialize(self.m_priv_key,
                                                   self.m_key_data,
                                                   self.m_key_net_ver)

    @staticmethod
    def __KeyFromBytes(key_bytes: bytes,
                       curve_type: EllipticCurveTypes) -> IPrivateKey:
        """
        Construct key from bytes.

        Args:
            key_bytes (bytes)              : Key bytes
            curve_type (EllipticCurveTypes): Elliptic curve type

        Returns:
            IPrivateKey object: IPrivateKey object

        Raises:
            Bip32KeyError: If the key constructed from the bytes is not valid
        """
        try:
            curve = EllipticCurveGetter.FromType(curve_type)
            return curve.PrivateKeyClass().FromBytes(key_bytes)
        except ValueError as ex:
            raise Bip32KeyError("Invalid private key bytes") from ex
