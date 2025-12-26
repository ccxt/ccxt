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
#

"""Module with BIP44 base class."""

# Imports
from __future__ import annotations

from abc import ABC, abstractmethod
from enum import IntEnum, unique
from functools import lru_cache
from typing import Union

from ..bip32 import Bip32Base, Bip32KeyData, Bip32KeyIndex
from ..bip44_base.bip44_base_ex import Bip44DepthError
from ..bip44_base.bip44_keys import Bip44PrivateKey, Bip44PublicKey
from ..conf.common import BipCoinConf, BipCoins
from ..ecc import IPrivateKey, IPublicKey


@unique
class Bip44Changes(IntEnum):
    """Enumerative for BIP44 changes."""

    CHAIN_EXT = 0
    CHAIN_INT = 1


@unique
class Bip44Levels(IntEnum):
    """Enumerative for BIP44 levels."""

    MASTER = 0
    PURPOSE = 1
    COIN = 2
    ACCOUNT = 3
    CHANGE = 4
    ADDRESS_INDEX = 5


class Bip44Base(ABC):
    """
    BIP44 base class.
    It allows coin, account, chain and address keys generation in according to BIP44 or its extensions.
    The class is meant to be derived by classes implementing BIP44 or its extensions.
    """

    m_bip32_obj: Bip32Base
    m_coin_conf: BipCoinConf

    #
    # Class methods for construction
    #

    @classmethod
    def _FromSeed(cls,
                  seed_bytes: bytes,
                  coin_conf: BipCoinConf) -> Bip44Base:
        """
        Create a Bip44Base object from the specified seed (e.g. BIP39 seed).

        Args:
            seed_bytes (bytes)     : Seed bytes
            coin_conf (BipCoinConf): BipCoinConf object

        Returns:
            Bip44Base object: Bip44Base object

        Raises:
            ValueError: If the seed is too short
            Bip32KeyError: If the seed is not suitable for master key generation
        """
        bip32_cls = coin_conf.Bip32Class()
        return cls(bip32_cls.FromSeed(seed_bytes,
                                      coin_conf.KeyNetVersions()),
                   coin_conf)

    @classmethod
    def _FromExtendedKey(cls,
                         ex_key_str: str,
                         coin_conf: BipCoinConf) -> Bip44Base:
        """
        Create a Bip44Base object from the specified extended key.

        Args:
            ex_key_str (str)       : Extended key string
            coin_conf (BipCoinConf): BipCoinConf object

        Returns:
            Bip44Base object: Bip44Base object

        Raises:
            Bip32KeyError: If the extended key is not valid
        """
        bip32_cls = coin_conf.Bip32Class()
        return cls(bip32_cls.FromExtendedKey(ex_key_str, coin_conf.KeyNetVersions()),
                   coin_conf)

    # @classmethod
    # def _FromPrivateKey(cls,
    #                     priv_key: Union[bytes, IPrivateKey],
    #                     coin_conf: BipCoinConf,
    #                     key_data: Bip32KeyData) -> Bip44Base:
    #     """
    #     Create a Bip44Base object from the specified private key and derivation data.
    #     If only the private key bytes are specified, the key will be considered a master key with
    #     the chain code set to zero, since there is no way to recover the key derivation data.

    #     Args:
    #         priv_key (bytes or IPrivateKey): Private key
    #         coin_conf (BipCoinConf)        : BipCoinConf object
    #         key_data (Bip32KeyData object) : Key data

    #     Returns:
    #         Bip44Base object: Bip44Base object

    #     Raises:
    #         Bip32KeyError: If the key is not valid
    #     """
    #     bip32_cls = coin_conf.Bip32Class()
    #     return cls(bip32_cls.FromPrivateKey(priv_key,
    #                                         key_data,
    #                                         coin_conf.KeyNetVersions()),
    #                coin_conf)

    # @classmethod
    # def _FromPublicKey(cls,
    #                    pub_key: Union[bytes, IPublicKey],
    #                    coin_conf: BipCoinConf,
    #                    key_data: Bip32KeyData) -> Bip44Base:
    #     """
    #     Create a Bip44Base object from the specified public key and derivation data.
    #     If only the public key bytes are specified, the key will be considered an account key with
    #     the chain code set to zero, since there is no way to recover the key derivation data.

    #     Args:
    #         pub_key (bytes or IPublicKey)  : Public key
    #         coin_conf (BipCoinConf)        : BipCoinConf object
    #         key_data (Bip32KeyData object) : Key data

    #     Returns:
    #         Bip44Base object: Bip44Base object

    #     Raises:
    #         Bip32KeyError: If the key is not valid
    #     """
    #     bip32_cls = coin_conf.Bip32Class()
    #     return cls(bip32_cls.FromPublicKey(pub_key,
    #                                        key_data,
    #                                        coin_conf.KeyNetVersions()),
    #                coin_conf)

    #
    # Public methods
    #

    def __init__(self,
                 bip32_obj: Bip32Base,
                 coin_conf: BipCoinConf) -> None:
        """
        Construct class.

        Args:
            bip32_obj (Bip32Base object): Bip32Base object
            coin_conf (BipCoinConf)     : BipCoinConf object

        Returns:
            Bip44DepthError: If the Bip32 object depth is not valid
        """
        depth = bip32_obj.Depth()

        # If the Bip32 is public-only, the depth shall start from the account level because hardened derivation is
        # used below it, which is not possible with public keys
        if bip32_obj.IsPublicOnly():
            if depth < Bip44Levels.ACCOUNT or depth > Bip44Levels.ADDRESS_INDEX:
                raise Bip44DepthError(
                    f"Depth of the public-only Bip object ({depth}) is below account level or "
                    f"beyond address index level"
                )
        # If the Bip32 object is not public-only, any depth is fine as long as it is not greater
        # than address index level
        else:
            if depth < 0 or depth > Bip44Levels.ADDRESS_INDEX:
                raise Bip44DepthError(
                    f"Depth of the Bip object ({depth}) is invalid or beyond address index level"
                )

        # Finally, initialize class
        self.m_bip32_obj = bip32_obj
        self.m_coin_conf = coin_conf

    @lru_cache()
    def PublicKey(self) -> Bip44PublicKey:
        """
        Return the public key.

        Returns:
            Bip44PublicKey object: Bip44PublicKey object
        """
        return Bip44PublicKey(self.m_bip32_obj.PublicKey(),
                              self.m_coin_conf)

    @lru_cache()
    def PrivateKey(self) -> Bip44PrivateKey:
        """
        Return the private key.

        Returns:
            Bip44PrivateKey object: Bip44PrivateKey object

        Raises:
            Bip32KeyError: If the Bip32 object is public-only
        """
        return Bip44PrivateKey(self.m_bip32_obj.PrivateKey(),
                               self.m_coin_conf)

    def Bip32Object(self) -> Bip32Base:
        """
        Return the BIP32 object.

        Returns:
            Bip32Base object: Bip32Base object
        """
        return self.m_bip32_obj

    def CoinConf(self) -> BipCoinConf:
        """
        Get coin configuration.

        Returns:
            BipCoinConf object: BipCoinConf object
        """
        return self.m_coin_conf

    def IsPublicOnly(self) -> bool:
        """
        Get if it's public-only.

        Returns:
            bool: True if public-only, false otherwise
        """
        return self.m_bip32_obj.IsPublicOnly()

    def Level(self) -> Bip44Levels:
        """
        Return the current level.

        Returns:
            Bip44Levels: Current level
        """
        return Bip44Levels(self.m_bip32_obj.Depth().ToInt())

    def IsLevel(self,
                level: Bip44Levels) -> bool:
        """
        Return if the current level is the specified one.

        Args:
            level (Bip44Levels): Level to be checked

        Returns:
            bool: True if it's the specified level, false otherwise

        Raises:
            TypeError: If the level index is not a Bip44Levels enum
        """
        if not isinstance(level, Bip44Levels):
            raise TypeError("Level is not an enumerative of Bip44Levels")
        return self.m_bip32_obj.Depth() == level

    def DeriveDefaultPath(self) -> Bip44Base:
        """
        Derive the default coin path and return a new Bip44Base object.

        Returns:
            Bip44Base object: Bip44Base object

        Raises:
            Bip44DepthError: If the current depth is not suitable for deriving keys
            Bip32KeyError: If the derivation results in an invalid key
        """
        # Derive purpose and coin by default
        bip_obj = self.Purpose().Coin()

        # Derive the remaining path
        return self.__class__(bip_obj.m_bip32_obj.DerivePath(bip_obj.m_coin_conf.DefaultPath()),
                              bip_obj.m_coin_conf)

    #
    # Protected class methods
    #

    def _PurposeGeneric(self,
                        purpose: int) -> Bip44Base:
        """
        Derive a child key from the purpose and return a new Bip44Base object.
        It shall be called from a child class.

        Args:
            purpose (int): Purpose

        Returns:
            Bip44Base object: Bip44Base object

        Raises:
            Bip44DepthError: If the current depth is not suitable for deriving keys
            Bip32KeyError: If the derivation results in an invalid key
        """
        if not self.IsLevel(Bip44Levels.MASTER):
            raise Bip44DepthError(
                f"Current depth ({self.m_bip32_obj.Depth().ToInt()}) is not suitable for deriving purpose"
            )

        return self.__class__(self.m_bip32_obj.ChildKey(purpose),
                              self.m_coin_conf)

    def _CoinGeneric(self) -> Bip44Base:
        """
        Derive a child key from the coin type specified at construction and return a new Bip44Base object.
        It shall be called from a child class.

        Returns:
            Bip44Base object: Bip44Base object

        Raises:
            Bip44DepthError: If the current depth is not suitable for deriving keys
            Bip32KeyError: If the derivation results in an invalid key
        """
        if not self.IsLevel(Bip44Levels.PURPOSE):
            raise Bip44DepthError(
                f"Current depth ({self.m_bip32_obj.Depth().ToInt()}) is not suitable for deriving coin"
            )

        coin_idx = self.m_coin_conf.CoinIndex()

        return self.__class__(self.m_bip32_obj.ChildKey(Bip32KeyIndex.HardenIndex(coin_idx)),
                              self.m_coin_conf)

    def _AccountGeneric(self,
                        acc_idx: int) -> Bip44Base:
        """
        Derive a child key from the specified account index and return a new Bip44Base object.
        It shall be called from a child class.

        Args:
            acc_idx (int): Account index

        Returns:
            Bip44Base object: Bip44Base object

        Raises:
            Bip44DepthError: If the current depth is not suitable for deriving keys
            Bip32KeyError: If the derivation results in an invalid key
        """
        if not self.IsLevel(Bip44Levels.COIN):
            raise Bip44DepthError(
                f"Current depth ({self.m_bip32_obj.Depth().ToInt()}) is not suitable for deriving account"
            )

        return self.__class__(self.m_bip32_obj.ChildKey(Bip32KeyIndex.HardenIndex(acc_idx)),
                              self.m_coin_conf)

    def _ChangeGeneric(self,
                       change_type: Bip44Changes) -> Bip44Base:
        """
        Derive a child key from the specified change type and return a new Bip44Base object.
        It shall be called from a child class.

        Args:
            change_type (Bip44Changes): Change type, must a Bip44Changes enum

        Returns:
            Bip44Base object: Bip44Base object

        Raises:
            TypeError: If change type is not a Bip44Changes enum
            Bip44DepthError: If the current depth is not suitable for deriving keys
            Bip32KeyError: If the derivation results in an invalid key
        """
        if not isinstance(change_type, Bip44Changes):
            raise TypeError("Change index is not an enumerative of Bip44Changes")

        if not self.IsLevel(Bip44Levels.ACCOUNT):
            raise Bip44DepthError(
                f"Current depth ({self.m_bip32_obj.Depth().ToInt()}) is not suitable for deriving change"
            )

        # Use hardened derivation if not-hardended is not supported
        if not self.m_bip32_obj.IsPublicDerivationSupported():
            change_idx = Bip32KeyIndex.HardenIndex(int(change_type))
        else:
            change_idx = int(change_type)

        return self.__class__(self.m_bip32_obj.ChildKey(change_idx),
                              self.m_coin_conf)

    def _AddressIndexGeneric(self,
                             addr_idx: int) -> Bip44Base:
        """
        Derive a child key from the specified address index and return a new Bip44Base object.
        It shall be called from a child class.

        Args:
            addr_idx (int): Address index

        Returns:
            Bip44Base object: Bip44Base object

        Raises:
            Bip44DepthError: If the current depth is not suitable for deriving keys
            Bip32KeyError: If the derivation results in an invalid key
        """
        if not self.IsLevel(Bip44Levels.CHANGE):
            raise Bip44DepthError(
                f"Current depth ({self.m_bip32_obj.Depth().ToInt()}) is not suitable for deriving address"
            )

        # Use hardened derivation if not-hardended is not supported
        if not self.m_bip32_obj.IsPublicDerivationSupported():
            addr_idx = Bip32KeyIndex.HardenIndex(addr_idx)

        return self.__class__(self.m_bip32_obj.ChildKey(addr_idx),
                              self.m_coin_conf)

    #
    # Abstract methods
    #

    @classmethod
    @abstractmethod
    def FromSeed(cls,
                 seed_bytes: bytes,
                 coin_type: BipCoins) -> Bip44Base:
        """
        Create a Bip44Base object from the specified seed (e.g. BIP39 seed).
        The test net flag is automatically set when the coin is derived. However, if you want to get the correct master
        or purpose keys, you have to specify here if it's a test net.

        Args:
            seed_bytes (bytes)  : Seed bytes
            coin_type (BipCoins): Coin type (the type depends on the specific child class)

        Returns:
            Bip44Base object: Bip44Base object

        Raises:
            TypeError: If coin type is not of the correct type
            ValueError: If the seed is too short
            Bip32KeyError: If the seed is not suitable for master key generation
        """

    @classmethod
    @abstractmethod
    def FromExtendedKey(cls,
                        ex_key_str: str,
                        coin_type: BipCoins) -> Bip44Base:
        """
        Create a Bip44Base object from the specified extended key.

        Args:
            ex_key_str (str)    : Extended key string
            coin_type (BipCoins): Coin type (the type depends on the specific child class)

        Returns:
            Bip44Base object: Bip44Base object

        Raises:
            TypeError: If coin type is not of the correct type
            Bip32KeyError: If the extended key is not valid
        """

    # @classmethod
    # @abstractmethod
    # def FromPrivateKey(cls,
    #                    priv_key: Union[bytes, IPrivateKey],
    #                    coin_type: BipCoins,
    #                    key_data: Bip32KeyData) -> Bip44Base:
    #     """
    #     Create a Bip44Base object from the specified private key and derivation data.
    #     If only the private key bytes are specified, the key will be considered a master key with
    #     the chain code set to zero, since there is no way to recover the key derivation data.

    #     Args:
    #         priv_key (bytes or IPrivateKey): Private key
    #         coin_type (BipCoins)           : Coin type, shall be a Bip44Coins enum
    #         key_data (Bip32KeyData object) : Key data

    #     Returns:
    #         Bip44Base object: Bip44Base object

    #     Raises:
    #         TypeError: If coin type is not a Bip44Coins enum
    #         Bip32KeyError: If the key is not valid
    #     """

    # @classmethod
    # @abstractmethod
    # def FromPublicKey(cls,
    #                   pub_key: Union[bytes, IPublicKey],
    #                   coin_type: BipCoins,
    #                   key_data: Bip32KeyData) -> Bip44Base:
    #     """
    #     Create a Bip44Base object from the specified public key and derivation data.
    #     If only the public key bytes are specified, the key will be considered an account key with
    #     the chain code set to zero, since there is no way to recover the key derivation data.

    #     Args:
    #         pub_key (bytes or IPublicKey) : Public key
    #         coin_type (BipCoins)          : Coin type, shall be a Bip44Coins enum
    #         key_data (Bip32KeyData object): Key data

    #     Returns:
    #         Bip44Base object: Bip44Base object

    #     Raises:
    #         TypeError: If coin type is not a Bip44Coins enum
    #         Bip32KeyError: If the key is not valid
    #     """

    @abstractmethod
    def Purpose(self) -> Bip44Base:
        """
        Derive a child key from the purpose and return a new Bip44Base object.

        Returns:
            Bip44Base object: Bip44Base object

        Raises:
            Bip44DepthError: If current depth is not suitable for deriving keys
            Bip32KeyError: If the derivation results in an invalid key
        """

    @abstractmethod
    def Coin(self) -> Bip44Base:
        """
        Derive a child key from the coin type specified at construction and return a new Bip44Base object.

        Returns:
            Bip44Base object: Bip44Base object

        Raises:
            Bip44DepthError: If current depth is not suitable for deriving keys
            Bip32KeyError: If the derivation results in an invalid key
        """

    @abstractmethod
    def Account(self,
                acc_idx: int) -> Bip44Base:
        """
        Derive a child key from the specified account index and return a new Bip44Base object.

        Args:
            acc_idx (int): Account index

        Returns:
            Bip44Base object: Bip44Base object

        Raises:
            Bip44DepthError: If current depth is not suitable for deriving keys
            Bip32KeyError: If the derivation results in an invalid key
        """

    @abstractmethod
    def Change(self,
               change_type: Bip44Changes) -> Bip44Base:
        """
        Derive a child key from the specified change type and return a new Bip44Base object.

        Args:
            change_type (Bip44Changes): Change type, must a Bip44Changes enum

        Returns:
            Bip44Base object: Bip44Base object

        Raises:
            TypeError: If change type is not a Bip44Changes enum
            Bip44DepthError: If current depth is not suitable for deriving keys
            Bip32KeyError: If the derivation results in an invalid key
        """

    @abstractmethod
    def AddressIndex(self,
                     addr_idx: int) -> Bip44Base:
        """
        Derive a child key from the specified address index and return a new Bip44Base object.

        Args:
            addr_idx (int): Address index

        Returns:
            Bip44Base object: Bip44Base object

        Raises:
            Bip44DepthError: If current depth is not suitable for deriving keys
            Bip32KeyError: If the derivation results in an invalid key
        """

    @staticmethod
    @abstractmethod
    def SpecName() -> str:
        """
        Get specification name.

        Returns:
            str: Specification name
        """
