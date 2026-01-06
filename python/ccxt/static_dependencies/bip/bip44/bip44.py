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
Module for BIP44 keys derivation.
Reference: https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki
"""

# Imports
from typing import Union

from ..bip32 import Bip32KeyData, Bip32KeyIndex, Bip32KeyNetVersions, Bip32Const, Bip32Slip10Secp256k1
from ..bip44_base import Bip44Base, Bip44Changes, Bip44Levels

_BIP44_BTC_KEY_NET_VER_MAIN: Bip32KeyNetVersions = Bip32Const.MAIN_NET_KEY_NET_VERSIONS

# from ..conf.bip44 import Bip44ConfGetter
# from ..conf.bip44 import BipCoinConf
from ..conf.common import BipCoins, BipCoinConf
from ..coin_conf import CoinsConf
from ..slip.slip44 import Slip44
from ..conf.common import DER_PATH_NON_HARDENED_FULL
# from bip_utils.ecc import IPrivateKey, IPublicKey


class Bip44Const:
    """Class container for BIP44 constants."""

    # Specification name
    SPEC_NAME: str = "BIP-0044"
    # Purpose
    PURPOSE: int = Bip32KeyIndex.HardenIndex(44)


class Bip44(Bip44Base):
    """
    BIP44 class.
    It allows master key generation and children keys derivation in according to BIP-0044.
    """

    #
    # Class methods for construction
    #

    @classmethod
    def FromSeed(cls,
                 seed_bytes: bytes) -> Bip44Base:
        """
        Create a Bip44Base object from the specified seed (e.g. BIP39 seed).

        Args:
            seed_bytes (bytes)  : Seed bytes
            coin_type (BipCoins): Coin type, shall be a Bip44Coins enum

        Returns:
            Bip44Base object: Bip44Base object

        Raises:
            TypeError: If coin type is not a Bip44Coins enum
            ValueError: If the seed is too short
            Bip32KeyError: If the seed is not suitable for master key generation
        """

        # Bip44ConfGetter already checks the enum type
        conf = BipCoinConf(
            coin_names=CoinsConf.Cosmos.CoinNames(),
            coin_idx=Slip44.ATOM,
            is_testnet=False,
            def_path=DER_PATH_NON_HARDENED_FULL,
            key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
            wif_net_ver=None,
            bip32_cls=Bip32Slip10Secp256k1,
            # addr_cls=AtomAddrEncoder,
            addr_params={
                "hrp": CoinsConf.Cosmos.ParamByKey("addr_hrp"),
            },
        )
        return cls._FromSeed(seed_bytes,
                             conf)

    @classmethod
    def FromExtendedKey(cls,
                        ex_key_str: str) -> Bip44Base:
        """
        Create a Bip44Base object from the specified extended key.

        Args:
            ex_key_str (str)    : Extended key string
            coin_type (BipCoins): Coin type, shall be a Bip44Coins enum

        Returns:
            Bip44Base object: Bip44Base object

        Raises:
            TypeError: If coin type is not a Bip44Coins enum
            Bip32KeyError: If the extended key is not valid
        """

        # Bip44ConfGetter already checks the enum type
        return cls._FromExtendedKey(ex_key_str, Bip44ConfGetter.GetConfig(coin_type))

    # @classmethod
    # def FromPrivateKey(cls,
    #                    priv_key: Union[bytes, IPrivateKey],
    #                    coin_type: BipCoins,
    #                    key_data: Bip32KeyData = Bip32KeyData()) -> Bip44Base:
    #     """
    #     Create a Bip44Base object from the specified private key and derivation data.
    #     If only the private key bytes are specified, the key will be considered a master key with
    #     the chain code set to zero, since there is no way to recover the key derivation data.

    #     Args:
    #         priv_key (bytes or IPrivateKey)         : Private key
    #         coin_type (BipCoins)                    : Coin type, shall be a Bip44Coins enum
    #         key_data (Bip32KeyData object, optional): Key data (default: all zeros)

    #     Returns:
    #         Bip44Base object: Bip44Base object

    #     Raises:
    #         TypeError: If coin type is not a Bip44Coins enum
    #         Bip32KeyError: If the key is not valid
    #     """

    #     # Bip44ConfGetter already checks the enum type
    #     return cls._FromPrivateKey(priv_key,
    #                                Bip44ConfGetter.GetConfig(coin_type),
    #                                key_data)

    # @classmethod
    # def FromPublicKey(cls,
    #                   pub_key: Union[bytes, IPublicKey],
    #                   coin_type: BipCoins,
    #                   key_data: Bip32KeyData = Bip32KeyData(depth=Bip44Levels.ACCOUNT)) -> Bip44Base:
    #     """
    #     Create a Bip44Base object from the specified public key and derivation data.
    #     If only the public key bytes are specified, the key will be considered an account key with
    #     the chain code set to zero, since there is no way to recover the key derivation data.

    #     Args:
    #         pub_key (bytes or IPublicKey)           : Public key
    #         coin_type (BipCoins)                    : Coin type, shall be a Bip44Coins enum
    #         key_data (Bip32KeyData object, optional): Key data (default: all zeros with account depth)

    #     Returns:
    #         Bip44Base object: Bip44Base object

    #     Raises:
    #         TypeError: If coin type is not a Bip44Coins enum
    #         Bip32KeyError: If the key is not valid
    #     """

    #     # Bip44ConfGetter already checks the enum type
    #     return cls._FromPublicKey(pub_key,
    #                               Bip44ConfGetter.GetConfig(coin_type),
    #                               key_data)

    #
    # Overridden abstract methods
    #

    def Purpose(self) -> Bip44Base:
        """
        Derive a child key from the purpose and return a new Bip44Base object.

        Returns:
            Bip44Base object: Bip44Base object

        Raises:
            Bip44DepthError: If current depth is not suitable for deriving keys
            Bip32KeyError: If the derivation results in an invalid key
        """
        return self._PurposeGeneric(Bip44Const.PURPOSE)

    def Coin(self) -> Bip44Base:
        """
        Derive a child key from the coin type specified at construction and return a new Bip44Base object.

        Returns:
            Bip44Base object: Bip44Base object

        Raises:
            Bip44DepthError: If current depth is not suitable for deriving keys
            Bip32KeyError: If the derivation results in an invalid key
        """
        return self._CoinGeneric()

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
        return self._AccountGeneric(acc_idx)

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
        return self._ChangeGeneric(change_type)

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
        return self._AddressIndexGeneric(addr_idx)

    @staticmethod
    def SpecName() -> str:
        """
        Get specification name.

        Returns:
            str: Specification name
        """
        return Bip44Const.SPEC_NAME
