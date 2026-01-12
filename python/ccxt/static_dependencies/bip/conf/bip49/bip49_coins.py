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

"""Module for BIP49 coins enum."""

# Imports
from enum import auto, unique

from .bip_coins import BipCoins


@unique
class Bip49Coins(BipCoins):
    """Enumerative for supported BIP49 coins."""

    # Main nets
    BITCOIN = auto()
    BITCOIN_CASH = auto()
    BITCOIN_CASH_SLP = auto()
    BITCOIN_SV = auto()
    DASH = auto()
    DOGECOIN = auto()
    ECASH = auto()
    LITECOIN = auto()
    ZCASH = auto()
    # Test nets
    BITCOIN_CASH_TESTNET = auto()
    BITCOIN_CASH_SLP_TESTNET = auto()
    BITCOIN_SV_TESTNET = auto()
    BITCOIN_REGTEST = auto()
    BITCOIN_TESTNET = auto()
    DASH_TESTNET = auto()
    DOGECOIN_TESTNET = auto()
    ECASH_TESTNET = auto()
    LITECOIN_TESTNET = auto()
    ZCASH_TESTNET = auto()
