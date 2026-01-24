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

"""Module for BIP44 coins enum."""

# Imports
from enum import auto, unique

from ..common.bip_coins import BipCoins


@unique
class Bip44Coins(BipCoins):
    """Enumerative for supported BIP44 coins."""

    # Main nets
    AKASH_NETWORK = auto()
    ALGORAND = auto()
    APTOS = auto()
    ARBITRUM = auto()
    AVAX_C_CHAIN = auto()
    AVAX_P_CHAIN = auto()
    AVAX_X_CHAIN = auto()
    AXELAR = auto()
    BAND_PROTOCOL = auto()
    BINANCE_CHAIN = auto()
    BINANCE_SMART_CHAIN = auto()
    BITCOIN = auto()
    BITCOIN_CASH = auto()
    BITCOIN_CASH_SLP = auto()
    BITCOIN_SV = auto()
    CARDANO_BYRON_ICARUS = auto()
    CARDANO_BYRON_LEDGER = auto()
    CELESTIA = auto()
    CELO = auto()
    CERTIK = auto()
    CHIHUAHUA = auto()
    COSMOS = auto()
    DASH = auto()
    DOGECOIN = auto()
    DYDX = auto()
    ECASH = auto()
    ELROND = auto()
    EOS = auto()
    ERGO = auto()
    ETHEREUM = auto()
    ETHEREUM_CLASSIC = auto()
    FANTOM_OPERA = auto()
    FETCH_AI = auto()
    FETCH_AI_ETH = auto()
    FILECOIN = auto()
    HARMONY_ONE_ATOM = auto()
    HARMONY_ONE_ETH = auto()
    HARMONY_ONE_METAMASK = auto()
    HUOBI_CHAIN = auto()
    ICON = auto()
    INJECTIVE = auto()
    IRIS_NET = auto()
    KAVA = auto()
    KUSAMA_ED25519_SLIP = auto()
    LITECOIN = auto()
    METIS = auto()
    MONERO_ED25519_SLIP = auto()
    MONERO_SECP256K1 = auto()
    MULTIVERSX = auto()
    NANO = auto()
    NEAR_PROTOCOL = auto()
    NEO = auto()
    NEO_LEGACY = auto()
    NEO_N3 = auto()
    NEUTRON = auto()
    NIMIQ = auto()
    NINE_CHRONICLES_GOLD = auto()
    OKEX_CHAIN_ATOM = auto()
    OKEX_CHAIN_ATOM_OLD = auto()
    OKEX_CHAIN_ETH = auto()
    ONTOLOGY = auto()
    OPTIMISM = auto()
    OSMOSIS = auto()
    PI_NETWORK = auto()
    POLKADOT_ED25519_SLIP = auto()
    POLYGON = auto()
    RIPPLE = auto()
    SECRET_NETWORK_OLD = auto()
    SECRET_NETWORK_NEW = auto()
    SOLANA = auto()
    STAFI = auto()
    STELLAR = auto()
    SUI = auto()
    TERRA = auto()
    TEZOS = auto()
    THETA = auto()
    TRON = auto()
    VECHAIN = auto()
    VERGE = auto()
    ZCASH = auto()
    ZILLIQA = auto()
    # Test nets
    BITCOIN_CASH_TESTNET = auto()
    BITCOIN_CASH_SLP_TESTNET = auto()
    BITCOIN_SV_TESTNET = auto()
    BITCOIN_REGTEST = auto()
    BITCOIN_TESTNET = auto()
    DASH_TESTNET = auto()
    DOGECOIN_TESTNET = auto()
    ECASH_TESTNET = auto()
    ERGO_TESTNET = auto()
    LITECOIN_TESTNET = auto()
    ZCASH_TESTNET = auto()
