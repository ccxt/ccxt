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

"""Module for getting BIP86 coins configuration."""

# Imports
from typing import Dict

from bip_utils.bip.conf.bip86.bip86_coins import Bip86Coins
from bip_utils.bip.conf.bip86.bip86_conf import Bip86Conf
from  import BipCoinConf, BipCoins


class Bip86ConfGetterConst:
    """Class container for BIP86 configuration getter constants."""

    # Map from Bip86Coins to configuration classes
    COIN_TO_CONF: Dict[BipCoins, BipCoinConf] = {
        Bip86Coins.BITCOIN: Bip86Conf.BitcoinMainNet,
        Bip86Coins.BITCOIN_REGTEST: Bip86Conf.BitcoinRegTest,
        Bip86Coins.BITCOIN_TESTNET: Bip86Conf.BitcoinTestNet,
    }


class Bip86ConfGetter:
    """
    BIP86 configuration getter class.
    It allows to get the BIP86 configuration of a specific coin.
    """

    @staticmethod
    def GetConfig(coin_type: BipCoins) -> BipCoinConf:
        """
        Get coin configuration.

        Args:
            coin_type (BipCoins): Coin type

        Returns:
            BipCoinConf: Coin configuration

        Raises:
            TypeError: If coin type is not of a Bip86Coins enumerative
        """
        if not isinstance(coin_type, Bip86Coins):
            raise TypeError("Coin type is not an enumerative of Bip86Coins")
        return Bip86ConfGetterConst.COIN_TO_CONF[coin_type]
