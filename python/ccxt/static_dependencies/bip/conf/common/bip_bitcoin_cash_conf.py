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

"""Module with helper class for Bitcoin Cash configuration handling."""

# Imports
from typing import Any, Dict, Type

from bip_utils.addr import IAddrEncoder
from bip_utils.bip.bip32 import Bip32KeyNetVersions
from bip_utils.bip.conf.common.bip_coin_conf import Bip32Base, BipCoinConf
from bip_utils.utils.conf import CoinNames


class BipBitcoinCashConf(BipCoinConf):
    """
    Bitcoin Cash configuration class.
    It allows to return different addresses depending on the configuration.
    """

    m_addr_cls_legacy: Type[IAddrEncoder]
    m_use_legacy_addr: bool

    def __init__(self,  # pylint: disable=too-many-arguments
                 coin_names: CoinNames,
                 coin_idx: int,
                 is_testnet: bool,
                 def_path: str,
                 key_net_ver: Bip32KeyNetVersions,
                 wif_net_ver: bytes,
                 bip32_cls: Type[Bip32Base],
                 addr_cls: Type[IAddrEncoder],
                 addr_cls_legacy: Type[IAddrEncoder],
                 addr_params: Dict[str, Any]) -> None:
        """
        Construct class.

        Args:
            coin_names (CoinNames object)           : Coin names
            coin_idx (int)                          : Coin index
            is_testnet (bool)                       : Test net flag
            def_path (str)                          : Default path
            key_net_ver (Bip32KeyNetVersions object): Key net versions
            wif_net_ver (bytes)                     : WIF net version
            bip32_cls (Bip32Base class)             : Bip32 class
            addr_params (dict)                      : Address parameters
            addr_cls (IAddrEncoder class)           : Address class
            addr_cls_legacy (IAddrEncoder class)    : Legacy ddress class
        """
        super().__init__(coin_names=coin_names,
                         coin_idx=coin_idx,
                         is_testnet=is_testnet,
                         def_path=def_path,
                         key_net_ver=key_net_ver,
                         wif_net_ver=wif_net_ver,
                         bip32_cls=bip32_cls,
                         addr_cls=addr_cls,
                         addr_params=addr_params)

        self.m_addr_cls_legacy = addr_cls_legacy
        self.m_use_legacy_addr = False

    def UseLegacyAddress(self,
                         value: bool) -> None:
        """
        Select if use the legacy address.

        Args:
            value (bool): True for using legacy address, false for using the standard one
        """
        self.m_use_legacy_addr = value

    def AddrClass(self) -> Type[IAddrEncoder]:
        """
        Get the address type. It overrides the method in BipCoinConf.

        Returns:
            IAddrEncoder class: Address class
        """
        return self.m_addr_cls_legacy if self.m_use_legacy_addr else self.m_addr_cls

    def AddrParams(self) -> Dict[str, Any]:
        """
        Get the address parameters. It overrides the method in BipCoinConf.

        Returns:
            dict: Address parameters
        """
        return self.m_addr_params["legacy"] if self.m_use_legacy_addr else self.m_addr_params["std"]
