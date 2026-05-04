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
Module for SLIP-0044 coin types.
Not all the coin types are defined, but only the used ones.
Reference: https://github.com/satoshilabs/slips/blob/master/slip-0044.md
"""


class Slip44:
    """
    SLIP-0044 class.
    It defines the coin types in according to SLIP-0044.
    """

    BITCOIN: int = 0
    TESTNET: int = 1
    LITECOIN: int = 2
    DOGECOIN: int = 3
    DASH: int = 5
    ETHEREUM: int = 60
    ETHEREUM_CLASSIC: int = 61
    ICON: int = 74
    VERGE: int = 77
    ATOM: int = 118
    MONERO: int = 128
    ZCASH: int = 133
    RIPPLE: int = 144
    BITCOIN_CASH: int = 145
    STELLAR: int = 148
    NANO: int = 165
    EOS: int = 194
    TRON: int = 195
    BITCOIN_SV: int = 236
    NIMIQ: int = 242
    ALGORAND: int = 283
    ZILLIQA: int = 313
    TERRA: int = 330
    POLKADOT: int = 354
    NEAR_PROTOCOL: int = 397
    ERGO: int = 429
    KUSAMA: int = 434
    KAVA: int = 459
    FILECOIN: int = 461
    BAND_PROTOCOL: int = 494
    THETA: int = 500
    SOLANA: int = 501
    ELROND: int = 508
    SECRET_NETWORK: int = 529
    NINE_CHRONICLES: int = 567
    APTOS: int = 637
    BINANCE_CHAIN: int = 714
    SUI: int = 784
    VECHAIN: int = 818
    NEO: int = 888
    OKEX_CHAIN: int = 996
    HARMONY_ONE: int = 1023
    ONTOLOGY: int = 1024
    TEZOS: int = 1729
    CARDANO: int = 1815
    AVALANCHE: int = 9000
    CELO: int = 52752
    PI_NETWORK: int = 314159
