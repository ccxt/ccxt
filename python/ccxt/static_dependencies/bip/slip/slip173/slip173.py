# Copyright (c) 2022 Emanuele Bellocchia
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
Module for SLIP-0173 human-readable parts.
Not all the human-readable parts are defined, but only the used ones.
Reference: https://github.com/satoshilabs/slips/blob/master/slip-0173.md
"""


class Slip173:
    """
    SLIP-0173 class.
    It defines the human-readable parts in according to SLIP-0173.
    """

    AKASH_NETWORK: str = "akash"
    AXELAR: str = "axelar"
    BAND_PROTOCOL: str = "band"
    BINANCE_CHAIN: str = "bnb"
    BITCOIN_MAINNET: str = "bc"
    BITCOIN_REGTEST: str = "bcrt"
    BITCOIN_TESTNET: str = "tb"
    CERTIK: str = "certik"
    CHIHUAHUA: str = "chihuahua"
    CELESTIA: str = "celestia"
    COSMOS: str = "cosmos"
    DYDX: str = "dydx"
    ELROND: str = "erd"
    FETCH_AI: str = "fetch"
    HARMONY_ONE: str = "one"
    INJECTIVE: str = "inj"
    IRIS_NETWORK: str = "iaa"
    KAVA: str = "kava"
    LITECOIN_MAINNET: str = "ltc"
    LITECOIN_TESTNET: str = "tltc"
    NEUTRON: str = "neutron"
    OKEX_CHAIN: str = "ex"
    OSMOSIS: str = "osmo"
    SECRET_NETWORK: str = "secret"
    STAFI: str = "stafi"
    TERRA: str = "terra"
    ZILLIQA: str = "zil"
