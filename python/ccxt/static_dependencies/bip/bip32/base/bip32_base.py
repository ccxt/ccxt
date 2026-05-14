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

"""Module with BIP32 base class."""

# Imports
from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Optional, Type, Union

from .ibip32_key_derivator import IBip32KeyDerivator
from .ibip32_mst_key_generator import IBip32MstKeyGenerator
from ..bip32_ex import Bip32KeyError
from ..bip32_key_data import Bip32ChainCode, Bip32Depth, Bip32FingerPrint, Bip32KeyData, Bip32KeyIndex
from ..bip32_key_net_ver import Bip32KeyNetVersions
from ..bip32_key_ser import Bip32KeyDeserializer
from ..bip32_keys import Bip32PrivateKey, Bip32PublicKey
from ..bip32_path import Bip32Path, Bip32PathParser
from ...ecc import EllipticCurve, EllipticCurveGetter, EllipticCurveTypes, IPoint, IPrivateKey, IPublicKey


class Bip32Base(ABC):
    """
    BIP32 base class.
    It allows master key generation and children keys derivation in according to BIP-0032/SLIP-0010.
    It shall be derived to implement derivation for a specific elliptic curve.
    """

    m_priv_key: Optional[Bip32PrivateKey]
    m_pub_key: Bip32PublicKey

    #
    # Class methods for construction
    #

    @classmethod
    def FromSeed(cls,
                 seed_bytes: bytes,
                 key_net_ver: Optional[Bip32KeyNetVersions] = None) -> Bip32Base:
        """
        Create a Bip32 object from the specified seed (e.g. BIP39 seed).

        Args:
            seed_bytes (bytes)                                : Seed bytes
            key_net_ver (Bip32KeyNetVersions object, optional): Bip32KeyNetVersions object
                                                                (default: specific class key net version)

        Returns:
            Bip32Base object: Bip32Base object

        Raises:
            ValueError: If the seed is too short
            Bip32KeyError: If the seed is not suitable for master key generation
        """
        priv_key_bytes, chain_code_bytes = cls._MasterKeyGenerator().GenerateFromSeed(seed_bytes)

        return cls(
            priv_key=priv_key_bytes,
            pub_key=None,
            key_data=Bip32KeyData(chain_code=chain_code_bytes),
            key_net_ver=key_net_ver or cls._DefaultKeyNetVersion()
        )

    @classmethod
    def FromSeedAndPath(cls,
                        seed_bytes: bytes,
                        path: Union[str, Bip32Path],
                        key_net_ver: Optional[Bip32KeyNetVersions] = None) -> Bip32Base:
        """
        Create a Bip32 object from the specified seed (e.g. BIP39 seed) and path.

        Args:
            seed_bytes (bytes)                                : Seed bytes
            path (str or Bip32Path object)                    : Path
            key_net_ver (Bip32KeyNetVersions object, optional): Bip32KeyNetVersions object
                                                                (default: specific class key net version)

        Returns:
            Bip32Base object: Bip32Base object

        Raises:
            ValueError: If the seed length is too short
            Bip32PathError: If the path is not valid
            Bip32KeyError: If the seed is not suitable for master key generation
        """
        key_net_ver = key_net_ver or cls._DefaultKeyNetVersion()
        return cls.FromSeed(seed_bytes, key_net_ver).DerivePath(path)

    @classmethod
    def FromExtendedKey(cls,
                        ex_key_str: str,
                        key_net_ver: Optional[Bip32KeyNetVersions] = None) -> Bip32Base:
        """
        Create a Bip32 object from the specified extended key.

        Args:
            ex_key_str (str)                                  : Extended key string
            key_net_ver (Bip32KeyNetVersions object, optional): Bip32KeyNetVersions object
                                                                (default: specific class key net version)

        Returns:
            Bip32Base object: Bip32Base object

        Raises:
            Bip32KeyError: If the key is not valid
        """
        key_net_ver = key_net_ver or cls._DefaultKeyNetVersion()

        # De-serialize key
        deser_key = Bip32KeyDeserializer.DeserializeKey(ex_key_str, key_net_ver)
        # Get key parts
        key_bytes, key_data, is_public = deser_key.KeyBytes(), deser_key.KeyData(), deser_key.IsPublic()

        # If depth is zero, fingerprint shall be the master one and child index shall be zero
        if key_data.Depth() == 0:
            if not key_data.ParentFingerPrint().IsMasterKey():
                raise Bip32KeyError(
                    f"Invalid extended master key (wrong fingerprint: {key_data.ParentFingerPrint().ToHex()})"
                )
            if key_data.Index() != 0:
                raise Bip32KeyError(f"Invalid extended master key (wrong child index: {key_data.Index().ToInt()})")

        return cls(
            priv_key=key_bytes if not is_public else None,
            pub_key=key_bytes if is_public else None,
            key_data=key_data,
            key_net_ver=key_net_ver
        )

    @classmethod
    def FromPrivateKey(cls,
                       priv_key: Union[bytes, IPrivateKey],
                       key_data: Bip32KeyData = Bip32KeyData(),
                       key_net_ver: Optional[Bip32KeyNetVersions] = None) -> Bip32Base:
        """
        Create a Bip32 object from the specified private key and derivation data.
        If only the private key bytes are specified, the key will be considered a master key with
        the chain code set to zero, since there is no way to recover the key derivation data.

        Args:
            priv_key (bytes or IPrivateKey)                   : Private key
            key_data (Bip32KeyData object, optional)          : Key data (default: all zeros)
            key_net_ver (Bip32KeyNetVersions object, optional): Bip32KeyNetVersions object
                                                                (default: specific class key net version)

        Returns:
            Bip32Base object: Bip32Base object

        Raises:
            Bip32KeyError: If the key is not valid
        """
        return cls(
            priv_key=priv_key,
            pub_key=None,
            key_data=key_data,
            key_net_ver=key_net_ver or cls._DefaultKeyNetVersion()
        )

    @classmethod
    def FromPublicKey(cls,
                      pub_key: Union[bytes, IPoint, IPublicKey],
                      key_data: Bip32KeyData = Bip32KeyData(),
                      key_net_ver: Optional[Bip32KeyNetVersions] = None) -> Bip32Base:
        """
        Create a Bip32 object from the specified public key and derivation data.
        If only the public key bytes are specified, the key will be considered a master key with
        the chain code set to zero, since there is no way to recover the key derivation data.

        Args:
            pub_key (bytes, IPoint or IPublicKey)             : Public key
            key_data (Bip32KeyData object, optional)          : Key data (default: all zeros)
            key_net_ver (Bip32KeyNetVersions object, optional): Bip32KeyNetVersions object
                                                                (default: specific class key net version)

        Returns:
            Bip32Base object: Bip32Base object

        Raises:
            Bip32KeyError: If the key is not valid
        """
        return cls(
            priv_key=None,
            pub_key=pub_key,
            key_data=key_data,
            key_net_ver=key_net_ver or cls._DefaultKeyNetVersion()
        )

    #
    # Public methods
    #

    def __init__(self,
                 priv_key: Optional[Union[bytes, IPrivateKey]],
                 pub_key: Optional[Union[bytes, IPoint, IPublicKey]],
                 key_data: Bip32KeyData,
                 key_net_ver: Bip32KeyNetVersions) -> None:
        """
        Construct class.

        Args:
            priv_key (bytes or IPrivateKey)         : Private key (None for a public-only object)
            pub_key (bytes, IPoint or IPublicKey)   : Public key (only needed for a public-only object)
                                                      If priv_key is not None, it'll be discarded
            key_data (Bip32KeyData object)          : Key data
            key_net_ver (Bip32KeyNetVersions object): Bip32KeyNetVersions object

        Raises:
            Bip32KeyError: If the constructed key is not valid
        """
        curve = self.Curve()

        # Private key object
        if priv_key is not None:
            # Check that key type matches the Bip curve
            if not isinstance(priv_key, bytes) and not isinstance(priv_key, curve.PrivateKeyClass()):
                raise Bip32KeyError(f"Invalid private key class, a {curve.Name()} key is required")

            self.m_priv_key = Bip32PrivateKey.FromBytesOrKeyObject(priv_key,
                                                                   key_data,
                                                                   key_net_ver,
                                                                   self.CurveType())
            self.m_pub_key = self.m_priv_key.PublicKey()
        # Public-only object
        else:
            # Check that key type matches the Bip curve
            if (not isinstance(pub_key, bytes)
                    and not isinstance(pub_key, curve.PointClass())
                    and not isinstance(pub_key, curve.PublicKeyClass())):
                raise Bip32KeyError(f"Invalid public key class, a {curve.Name()} key or point is required")

            self.m_priv_key = None
            self.m_pub_key = Bip32PublicKey.FromBytesOrKeyObject(pub_key,
                                                                 key_data,
                                                                 key_net_ver,
                                                                 self.CurveType())

    def ChildKey(self,
                 index: Union[int, Bip32KeyIndex]) -> Bip32Base:
        """
        Create and return a child key of the current one with the specified index.
        The index shall be hardened using HardenIndex method to use the private derivation algorithm.

        Args:
            index (int or Bip32KeyIndex object): Index

        Returns:
            Bip32Base object: Bip32Base object

        Raises:
            Bip32KeyError: If the index results in an invalid key
        """
        index = self.__GetIndex(index)
        return self.__ValidateAndCkdPriv(index) if not self.IsPublicOnly() else self.__ValidateAndCkdPub(index)

    def DerivePath(self,
                   path: Union[str, Bip32Path]) -> Bip32Base:
        """
        Derive children keys from the specified path.

        Args:
            path (str or Bip32Path object): Path

        Returns:
            Bip32Base object: Bip32Base object

        Raises:
            Bip32KeyError: If the index results in an invalid key
            Bip32PathError: If the path is not valid
            ValueError: If the path is a master path and the key is a child key
        """
        path = self.__GetPath(path)
        if self.Depth() > 0 and path.IsAbsolute():
            raise ValueError("Absolute paths can only be derived from a master key, not child ones")

        bip32_obj = self
        # Derive children keys
        for path_elem in path:
            bip32_obj = bip32_obj.ChildKey(path_elem)

        return bip32_obj

    def ConvertToPublic(self) -> None:
        """Convert the object into a public one."""
        self.m_priv_key = None

    def IsPublicOnly(self) -> bool:
        """
        Get if it's public-only.

        Returns:
            bool: True if public-only, false otherwise
        """
        return self.m_priv_key is None

    def PrivateKey(self) -> Bip32PrivateKey:
        """
        Return private key object.

        Returns:
            Bip32PrivateKey object: Bip32PrivateKey object

        Raises:
            Bip32KeyError: If internal key is public-only
        """
        if self.IsPublicOnly():
            raise Bip32KeyError("Public-only deterministic keys have no private half")

        assert isinstance(self.m_priv_key, Bip32PrivateKey)
        return self.m_priv_key

    def PublicKey(self) -> Bip32PublicKey:
        """
        Return public key object.

        Returns:
            Bip32PublicKey object: Bip32PublicKey object
        """
        return self.m_pub_key

    def KeyNetVersions(self) -> Bip32KeyNetVersions:
        """
        Get key net versions.

        Returns:
            Bip32KeyNetVersions object: Bip32KeyNetVersions object
        """
        return self.m_pub_key.KeyNetVersions()

    def Depth(self) -> Bip32Depth:
        """
        Get current depth.

        Returns:
            Bip32Depth object: Current depth
        """
        return self.m_pub_key.Data().Depth()

    def Index(self) -> Bip32KeyIndex:
        """
        Get current index.

        Returns:
            Bip32KeyIndex object: Current index
        """
        return self.m_pub_key.Data().Index()

    def ChainCode(self) -> Bip32ChainCode:
        """
        Get chain code.

        Returns:
            Bip32ChainCode: Chain code
        """
        return self.m_pub_key.ChainCode()

    def FingerPrint(self) -> Bip32FingerPrint:
        """
        Get public key fingerprint.

        Returns:
            Bip32FingerPrint object: Public key fingerprint bytes
        """
        return self.m_pub_key.FingerPrint()

    def ParentFingerPrint(self) -> Bip32FingerPrint:
        """
        Get parent fingerprint.

        Returns:
            Bip32FingerPrint object: Parent fingerprint bytes
        """
        return self.m_pub_key.Data().ParentFingerPrint()

    @classmethod
    def Curve(cls) -> EllipticCurve:
        """
        Return the elliptic curve.

        Returns:
            EllipticCurve object: EllipticCurve object
        """
        return EllipticCurveGetter.FromType(cls.CurveType())

    @classmethod
    def IsPublicDerivationSupported(cls) -> bool:
        """
        Get if public derivation is supported.

        Returns:
            bool: True if supported, false otherwise.
        """
        return cls._KeyDerivator().IsPublicDerivationSupported()

    #
    # Private methods
    #

    def __ValidateAndCkdPriv(self,
                             index: Bip32KeyIndex) -> Bip32Base:
        """
        Check the key index validity and create a child key with the specified index using private derivation.

        Args:
            index (Bip32KeyIndex object): Key index

        Returns:
            Bip32Base object: Bip32Base object

        Raises:
            Bip32KeyError: If the index results in an invalid key
        """
        return self.__CkdPriv(index)

    def __ValidateAndCkdPub(self,
                            index: Bip32KeyIndex) -> Bip32Base:
        """
        Check the key index validity and create a child key with the specified index using public derivation.

        Args:
            index (Bip32KeyIndex object): Key index

        Returns:
            Bip32Base object: Bip32Base object

        Raises:
            Bip32KeyError: If the index results in an invalid key
        """

        # Hardened index is not supported for public derivation
        if index.IsHardened():
            raise Bip32KeyError("Public child derivation cannot be used to create a hardened child key")

        return self.__CkdPub(index)

    def __CkdPriv(self,
                  index: Bip32KeyIndex) -> Bip32Base:
        """
        Derive a child key with the specified index using private derivation.

        Args:
            index (Bip32KeyIndex object): Key index

        Returns:
            Bip32Base object: Bip32Base object

        Raises:
            Bip32KeyError: If the index results in an invalid key
        """
        assert self.m_priv_key is not None


        priv_key_bytes, chain_code_bytes = self._KeyDerivator().CkdPriv(self.m_priv_key,
                                                                        self.m_pub_key,
                                                                        index)
        return self.__class__(
            priv_key=priv_key_bytes,
            pub_key=None,
            key_data=Bip32KeyData(
                chain_code=chain_code_bytes,
                depth=self.Depth().Increase(),
                index=index,
                parent_fprint=self.FingerPrint()
            ),
            key_net_ver=self.KeyNetVersions()
        )

    def __CkdPub(self,
                 index: Bip32KeyIndex) -> Bip32Base:
        """
        Derive a child key with the specified index using public derivation.

        Args:
            index (Bip32KeyIndex object): Key index

        Returns:
            Bip32Base object: Bip32Base object

        Raises:
            Bip32KeyError: If the index results in an invalid key
        """
        pub_key_bytes, chain_code_bytes = self._KeyDerivator().CkdPub(self.m_pub_key,
                                                                      index)
        return self.__class__(
            priv_key=None,
            pub_key=pub_key_bytes,
            key_data=Bip32KeyData(
                chain_code=chain_code_bytes,
                depth=self.Depth().Increase(),
                index=index,
                parent_fprint=self.FingerPrint()
            ),
            key_net_ver=self.KeyNetVersions()
        )

    @staticmethod
    def __GetIndex(index: Union[int, Bip32KeyIndex]) -> Bip32KeyIndex:
        """
        Get index object.

        Args:
            index (int or Bip32KeyIndex): Index

        Returns:
            Bip32KeyIndex object: Bip32KeyIndex object
        """
        return Bip32KeyIndex(index) if isinstance(index, int) else index

    @staticmethod
    def __GetPath(path: Union[str, Bip32Path]) -> Bip32Path:
        """
        Get path object.

        Args:
            path (str or Bip32Path): Path

        Returns:
            Bip32Path object: Bip32Path object
        """
        return Bip32PathParser.Parse(path) if isinstance(path, str) else path

    #
    # Abstract methods
    #

    @staticmethod
    @abstractmethod
    def CurveType() -> EllipticCurveTypes:
        """
        Return the elliptic curve type.

        Returns:
            EllipticCurveTypes: Curve type
        """

    @staticmethod
    @abstractmethod
    def _DefaultKeyNetVersion() -> Bip32KeyNetVersions:
        """
        Return the default key net version.

        Returns:
            Bip32KeyNetVersions object: Bip32KeyNetVersions object
        """

    @staticmethod
    @abstractmethod
    def _KeyDerivator() -> Type[IBip32KeyDerivator]:
        """
        Return the key derivator class.

        Returns:
            IBip32KeyDerivator class: Key derivator class
        """

    @staticmethod
    @abstractmethod
    def _MasterKeyGenerator() -> Type[IBip32MstKeyGenerator]:
        """
        Return the master key generator class.

        Returns:
            IBip32MstKeyGenerator class: Master key generator class
        """
