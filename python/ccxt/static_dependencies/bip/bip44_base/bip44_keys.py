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

"""Module for BIP44 keys handling."""

# Imports
from functools import lru_cache

# from ..addr import AdaShelleyAddrEncoder, XmrAddrEncoder
from ..bip32 import Bip32ChainCode, Bip32PrivateKey, Bip32PublicKey
from ..conf.common import BipCoinConf
from ..utils.misc import DataBytes
from ..wif import WifEncoder, WifPubKeyModes


class Bip44PublicKey:
    """
    BIP44 public key class.
    It contains Bip32PublicKey and add the possibility to compute the address from the coin type.
    """

    m_pub_key: Bip32PublicKey
    m_coin_conf: BipCoinConf

    def __init__(self,
                 pub_key: Bip32PublicKey,
                 coin_conf: BipCoinConf) -> None:
        """
        Construct class.

        Args:
            pub_key (Bip32PublicKey object): Bip32PublicKey object
            coin_conf (BipCoinConf object) : BipCoinConf object

        Raises:
            ValueError: If the key elliptic curve is different from the coin configuration one
        """
        if pub_key.CurveType() != coin_conf.Bip32Class().CurveType():
            raise ValueError(
                f"The public key elliptic curve ({pub_key.CurveType()}) shall match "
                f"the coin configuration one ({coin_conf.Bip32Class().CurveType()})"
            )

        self.m_pub_key = pub_key
        self.m_coin_conf = coin_conf

    def Bip32Key(self) -> Bip32PublicKey:
        """
        Return the BIP32 key object.

        Returns:
            Bip32PublicKey object: BIP32 key object
        """
        return self.m_pub_key

    def ToExtended(self) -> str:
        """
        Return key in serialized extended format.

        Returns:
            str: Key in serialized extended format
        """
        return self.m_pub_key.ToExtended()

    def ChainCode(self) -> Bip32ChainCode:
        """
        Return the chain code.

        Returns:
            Bip32ChainCode object: Bip32ChainCode object
        """
        return self.m_pub_key.ChainCode()

    def RawCompressed(self) -> DataBytes:
        """
        Return raw compressed public key.

        Returns:
            DataBytes object: DataBytes object
        """
        return self.m_pub_key.RawCompressed()

    def RawUncompressed(self) -> DataBytes:
        """
        Return raw uncompressed public key.

        Returns:
            DataBytes object: DataBytes object
        """
        return self.m_pub_key.RawUncompressed()

    @lru_cache()
    def ToAddress(self) -> str:
        """
        Return the address correspondent to the public key.

        Returns:
            str: Address string
        """
        addr_cls = self.m_coin_conf.AddrClass()
        pub_key_obj = self.m_pub_key.KeyObject()

        # # Exception for Cardano
        # if addr_cls is AdaShelleyAddrEncoder:
        #     raise ValueError("Use the CardanoShelley class to get Cardano Shelley addresses")
        # # Exception for Monero
        # if addr_cls is XmrAddrEncoder:
        #     raise ValueError("Use the Monero class to get Monero addresses")

        return addr_cls.EncodeKey(pub_key_obj,
                                  **self.m_coin_conf.AddrParamsWithResolvedCalls(self.m_pub_key))


class Bip44PrivateKey:
    """
    BIP44 private key class.
    It contains Bip32PrivateKey and add the possibility to compute the WIF from the coin type.
    """

    m_priv_key: Bip32PrivateKey
    m_coin_conf: BipCoinConf

    def __init__(self,
                 priv_key: Bip32PrivateKey,
                 coin_conf: BipCoinConf) -> None:
        """
        Construct class.

        Args:
            priv_key (Bip32PrivateKey object): Bip32PrivateKey object
            coin_conf (BipCoinConf object)   : BipCoinConf object

        Raises:
            ValueError: If the key elliptic curve is different from the coin configuration one
        """
        if priv_key.CurveType() != coin_conf.Bip32Class().CurveType():
            raise ValueError(
                f"The private key elliptic curve ({priv_key.CurveType()}) shall match "
                f"the coin configuration one ({coin_conf.Bip32Class().CurveType()})"
            )

        self.m_priv_key = priv_key
        self.m_coin_conf = coin_conf

    def Bip32Key(self) -> Bip32PrivateKey:
        """
        Return the BIP32 key object.

        Returns:
            Bip32PublicKey object: BIP32 key object
        """
        return self.m_priv_key

    def ToExtended(self) -> str:
        """
        Return key in serialized extended format.

        Returns:
            str: Key in serialized extended format
        """
        return self.m_priv_key.ToExtended()

    def ChainCode(self) -> Bip32ChainCode:
        """
        Return the chain code.

        Returns:
            Bip32ChainCode object: Bip32ChainCode object
        """
        return self.m_priv_key.ChainCode()

    def Raw(self) -> DataBytes:
        """
        Return raw compressed public key.

        Returns:
            DataBytes object: DataBytes object
        """
        return self.m_priv_key.Raw()

    @lru_cache()
    def PublicKey(self) -> Bip44PublicKey:
        """
        Get the public key correspondent to the private one.

        Returns:
            Bip44PublicKey object: Bip44PublicKey object
        """
        return Bip44PublicKey(self.m_priv_key.PublicKey(),
                              self.m_coin_conf)

    @lru_cache()
    def ToWif(self,
              pub_key_mode: WifPubKeyModes = WifPubKeyModes.COMPRESSED) -> str:
        """
        Return key in WIF format.

        Args:
            pub_key_mode (WifPubKeyModes): Specify if the private key corresponds to a compressed public key

        Returns:
            str: Key in WIF format
        """
        wif_net_ver = self.m_coin_conf.WifNetVersion()

        return (WifEncoder.Encode(self.m_priv_key.Raw().ToBytes(), wif_net_ver, pub_key_mode)
                if wif_net_ver is not None
                else "")
