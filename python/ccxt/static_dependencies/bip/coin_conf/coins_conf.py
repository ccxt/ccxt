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

"""Module with generic coins configuration for all other modules."""

# Imports
from .coin_conf import CoinConf
from ..slip.slip173 import Slip173
from ..utils.conf import CoinNames


# Bitcoin constants used by different coins
# Main net
_BTC_P2PKH_NET_VER_MN: bytes = b"\x00"
_BTC_P2SH_NET_VER_MN: bytes = b"\x05"
_BTC_P2WPKH_HRP_MN: str = Slip173.BITCOIN_MAINNET
_BTC_P2WPKH_WIT_VER_MN: int = 0
_BTC_P2TR_HRP_MN: str = Slip173.BITCOIN_MAINNET
_BTC_P2TR_WIT_VER_MN: int = 1
_BTC_WIF_NET_VER_MN: bytes = b"\x80"
# Test net
_BTC_P2PKH_NET_VER_TN: bytes = b"\x6f"
_BTC_P2SH_NET_VER_TN: bytes = b"\xc4"
_BTC_P2WPKH_HRP_TN: str = Slip173.BITCOIN_TESTNET
_BTC_P2WPKH_WIT_VER_TN: int = 0
_BTC_P2TR_HRP_TN: str = Slip173.BITCOIN_TESTNET
_BTC_P2TR_WIT_VER_TN: int = 1
_BTC_WIF_NET_VER_TN: bytes = b"\xef"
# Regtest
_BTC_P2PKH_NET_VER_RT: bytes = _BTC_P2PKH_NET_VER_TN
_BTC_P2SH_NET_VER_RT: bytes = _BTC_P2SH_NET_VER_TN
_BTC_P2WPKH_HRP_RT: str = Slip173.BITCOIN_REGTEST
_BTC_P2WPKH_WIT_VER_RT: int = _BTC_P2TR_WIT_VER_TN
_BTC_P2TR_HRP_RT: str = Slip173.BITCOIN_REGTEST
_BTC_P2TR_WIT_VER_RT: int = _BTC_P2TR_WIT_VER_TN
_BTC_WIF_NET_VER_RT: bytes = _BTC_WIF_NET_VER_TN


class CoinsConf:
    """Class container for coins configuration."""

    # # Configuration for Acala
    # Acala: CoinConf = CoinConf(
    #     coin_name=CoinNames("Acala", "ACA"),
    #     params={
    #         "addr_ss58_format": 10,
    #     },
    # )

    # # Configuration for Akash Network
    # AkashNetwork: CoinConf = CoinConf(
    #     coin_name=CoinNames("Akash Network", "AKT"),
    #     params={
    #         "addr_hrp": Slip173.AKASH_NETWORK,
    #     },
    # )

    # # Configuration for Algorand
    # Algorand: CoinConf = CoinConf(
    #     coin_name=CoinNames("Algorand", "ALGO"),
    #     params={},
    # )

    # # Configuration for Aptos
    # Aptos: CoinConf = CoinConf(
    #     coin_name=CoinNames("Aptos", "APTOS"),
    #     params={
    #         "addr_prefix": "0x",
    #     },
    # )

    # # Configuration for Arbitrum
    # Arbitrum: CoinConf = CoinConf(
    #     coin_name=CoinNames("Arbitrum", "ARB"),
    #     params={},
    # )

    # # Configuration for Avax C-Chain
    # AvaxCChain: CoinConf = CoinConf(
    #     coin_name=CoinNames("Avax C-Chain", "AVAX"),
    #     params={},
    # )

    # # Configuration for Avax P-Chain
    # AvaxPChain: CoinConf = CoinConf(
    #     coin_name=CoinNames("Avax P-Chain", "AVAX"),
    #     params={
    #         "addr_hrp": "avax",
    #         "addr_prefix": "P-",
    #     },
    # )

    # # Configuration for Avax X-Chain
    # AvaxXChain: CoinConf = CoinConf(
    #     coin_name=CoinNames("Avax X-Chain", "AVAX"),
    #     params={
    #         "addr_hrp": "avax",
    #         "addr_prefix": "X-",
    #     },
    # )

    # # Configuration for Axelar
    # Axelar: CoinConf = CoinConf(
    #     coin_name=CoinNames("Axelar", "AXL"),
    #     params={
    #         "addr_hrp": Slip173.AXELAR,
    #     },
    # )

    # # Configuration for Band Protocol
    # BandProtocol: CoinConf = CoinConf(
    #     coin_name=CoinNames("Band Protocol", "BAND"),
    #     params={
    #         "addr_hrp": Slip173.BAND_PROTOCOL,
    #     },
    # )

    # # Configuration for Bifrost
    # Bifrost: CoinConf = CoinConf(
    #     coin_name=CoinNames("Bifrost", "BNC"),
    #     params={
    #         "addr_ss58_format": 6,
    #     },
    # )

    # # Configuration for Binance Chain
    # BinanceChain: CoinConf = CoinConf(
    #     coin_name=CoinNames("Binance Chain", "BNB"),
    #     params={
    #         "addr_hrp": Slip173.BINANCE_CHAIN,
    #     },
    # )

    # # Configuration for Binance Smart Chain
    # BinanceSmartChain: CoinConf = CoinConf(
    #     coin_name=CoinNames("Binance Smart Chain", "BNB"),
    #     params={},
    # )

    # Configuration for Bitcoin main net
    BitcoinMainNet: CoinConf = CoinConf(
        coin_name=CoinNames("Bitcoin", "BTC"),
        params={
            "p2pkh_net_ver": _BTC_P2PKH_NET_VER_MN,
            "p2sh_net_ver": _BTC_P2SH_NET_VER_MN,
            "p2wpkh_hrp": _BTC_P2WPKH_HRP_MN,
            "p2wpkh_wit_ver": _BTC_P2WPKH_WIT_VER_MN,
            "p2tr_hrp": _BTC_P2TR_HRP_MN,
            "p2tr_wit_ver": _BTC_P2TR_WIT_VER_MN,
            "wif_net_ver": _BTC_WIF_NET_VER_MN,
        },
    )

    # # Configuration for Bitcoin test net
    # BitcoinTestNet: CoinConf = CoinConf(
    #     coin_name=CoinNames("Bitcoin TestNet", "BTC"),
    #     params={
    #         "p2pkh_net_ver": _BTC_P2PKH_NET_VER_TN,
    #         "p2sh_net_ver": _BTC_P2SH_NET_VER_TN,
    #         "p2wpkh_hrp": _BTC_P2WPKH_HRP_TN,
    #         "p2wpkh_wit_ver": _BTC_P2WPKH_WIT_VER_TN,
    #         "p2tr_hrp": _BTC_P2TR_HRP_TN,
    #         "p2tr_wit_ver": _BTC_P2TR_WIT_VER_TN,
    #         "wif_net_ver": _BTC_WIF_NET_VER_TN,
    #     },
    # )

    # # Configuration for Bitcoin regtest
    # BitcoinRegTest: CoinConf = CoinConf(
    #     coin_name=CoinNames("Bitcoin RegTest", "BTC"),
    #     params={
    #         "p2pkh_net_ver": _BTC_P2PKH_NET_VER_RT,
    #         "p2sh_net_ver": _BTC_P2SH_NET_VER_RT,
    #         "p2wpkh_hrp": _BTC_P2WPKH_HRP_RT,
    #         "p2wpkh_wit_ver": _BTC_P2WPKH_WIT_VER_RT,
    #         "p2tr_hrp": _BTC_P2TR_HRP_RT,
    #         "p2tr_wit_ver": _BTC_P2TR_WIT_VER_RT,
    #         "wif_net_ver": _BTC_WIF_NET_VER_RT,
    #     },
    # )

    # # Configuration for Bitcoin Cash main net
    # BitcoinCashMainNet: CoinConf = CoinConf(
    #     coin_name=CoinNames("Bitcoin Cash", "BCH"),
    #     params={
    #         "p2pkh_std_hrp": "bitcoincash",
    #         "p2pkh_std_net_ver": _BTC_P2PKH_NET_VER_MN,
    #         "p2pkh_legacy_net_ver": _BTC_P2PKH_NET_VER_MN,
    #         "p2sh_std_hrp": "bitcoincash",
    #         "p2sh_std_net_ver": b"\x08",
    #         "p2sh_legacy_net_ver": _BTC_P2SH_NET_VER_MN,
    #         "wif_net_ver": _BTC_WIF_NET_VER_MN,
    #     },
    # )

    # # Configuration for Bitcoin Cash test net
    # BitcoinCashTestNet: CoinConf = CoinConf(
    #     coin_name=CoinNames("Bitcoin Cash TestNet", "BCH"),
    #     params={
    #         "p2pkh_std_hrp": "bchtest",
    #         "p2pkh_std_net_ver": b"\x00",
    #         "p2pkh_legacy_net_ver": _BTC_P2PKH_NET_VER_TN,
    #         "p2sh_std_hrp": "bchtest",
    #         "p2sh_std_net_ver": b"\x08",
    #         "p2sh_legacy_net_ver": _BTC_P2SH_NET_VER_TN,
    #         "wif_net_ver": _BTC_WIF_NET_VER_TN,
    #     },
    # )

    # # Configuration for Bitcoin Cash Simple Ledger Protocol main net
    # BitcoinCashSlpMainNet: CoinConf = CoinConf(
    #     coin_name=CoinNames("Bitcoin Cash SLP", "SLP"),
    #     params={
    #         "p2pkh_std_hrp": "simpleledger",
    #         "p2pkh_std_net_ver": b"\x00",
    #         "p2pkh_legacy_net_ver": _BTC_P2PKH_NET_VER_MN,
    #         "p2sh_std_hrp": "simpleledger",
    #         "p2sh_std_net_ver": b"\x08",
    #         "p2sh_legacy_net_ver": _BTC_P2SH_NET_VER_MN,
    #         "wif_net_ver": _BTC_WIF_NET_VER_MN,
    #     },
    # )

    # # Configuration for Bitcoin Cash Simple Ledger Protocol test net
    # BitcoinCashSlpTestNet: CoinConf = CoinConf(
    #     coin_name=CoinNames("Bitcoin Cash SLP TestNet", "SLP"),
    #     params={
    #         "p2pkh_std_hrp": "slptest",
    #         "p2pkh_std_net_ver": b"\x00",
    #         "p2pkh_legacy_net_ver": _BTC_P2PKH_NET_VER_TN,
    #         "p2sh_std_hrp": "slptest",
    #         "p2sh_std_net_ver": b"\x08",
    #         "p2sh_legacy_net_ver": _BTC_P2SH_NET_VER_TN,
    #         "wif_net_ver": _BTC_WIF_NET_VER_TN,
    #     },
    # )

    # # Configuration for Bitcoin SV main net
    # BitcoinSvMainNet: CoinConf = CoinConf(
    #     coin_name=CoinNames("BitcoinSV", "BSV"),
    #     params={
    #         "p2pkh_net_ver": _BTC_P2PKH_NET_VER_MN,
    #         "p2sh_net_ver": _BTC_P2SH_NET_VER_MN,
    #         "wif_net_ver": _BTC_WIF_NET_VER_MN,
    #     },
    # )

    # # Configuration for Bitcoin SV test net
    # BitcoinSvTestNet: CoinConf = CoinConf(
    #     coin_name=CoinNames("BitcoinSV TestNet", "BSV"),
    #     params={
    #         "p2pkh_net_ver": _BTC_P2PKH_NET_VER_TN,
    #         "p2sh_net_ver": _BTC_P2SH_NET_VER_TN,
    #         "wif_net_ver": _BTC_WIF_NET_VER_TN,
    #     },
    # )

    # # Configuration for Cardano main net
    # CardanoMainNet: CoinConf = CoinConf(
    #     coin_name=CoinNames("Cardano", "ADA"),
    #     params={
    #         "addr_hrp": "addr",
    #         "staking_addr_hrp": "stake",
    #     },
    # )

    # # Configuration for Cardano test
    # CardanoTestNet: CoinConf = CoinConf(
    #     coin_name=CoinNames("Cardano TestNet", "ADA"),
    #     params={
    #         "addr_hrp": "addr_test",
    #         "staking_addr_hrp": "stake_test",
    #     },
    # )

    # # Configuration for Celestia
    # Celestia: CoinConf = CoinConf(
    #     coin_name=CoinNames("Celestia", "TIA"),
    #     params={
    #         "addr_hrp": Slip173.CELESTIA,
    #     },
    # )

    # # Configuration for Celo
    # Celo: CoinConf = CoinConf(
    #     coin_name=CoinNames("Celo", "CELO"),
    #     params={},
    # )

    # # Configuration for Certik
    # Certik: CoinConf = CoinConf(
    #     coin_name=CoinNames("Certik", "CTK"),
    #     params={
    #         "addr_hrp": Slip173.CERTIK,
    #     },
    # )

    # # Configuration for ChainX
    # ChainX: CoinConf = CoinConf(
    #     coin_name=CoinNames("ChainX", "PCX"),
    #     params={
    #         "addr_ss58_format": 44,
    #     },
    # )

    # # Configuration for Chihuahua
    # Chihuahua: CoinConf = CoinConf(
    #     coin_name=CoinNames("Chihuahua", "HUAHUA"),
    #     params={
    #         "addr_hrp": Slip173.CHIHUAHUA,
    #     },
    # )

    # Configuration for Cosmos
    Cosmos: CoinConf = CoinConf(
        coin_name=CoinNames("Cosmos", "ATOM"),
        params={
            "addr_hrp": Slip173.COSMOS,
        },
    )

    # # Configuration for Dash main net
    # DashMainNet: CoinConf = CoinConf(
    #     coin_name=CoinNames("Dash", "DASH"),
    #     params={
    #         "p2pkh_net_ver": b"\x4c",
    #         "p2sh_net_ver": b"\x10",
    #         "wif_net_ver": b"\xcc",
    #     },
    # )

    # # Configuration for Dash test net
    # DashTestNet: CoinConf = CoinConf(
    #     coin_name=CoinNames("Dash TestNet", "DASH"),
    #     params={
    #         "p2pkh_net_ver": b"\x8c",
    #         "p2sh_net_ver": b"\x13",
    #         "wif_net_ver": _BTC_WIF_NET_VER_TN,
    #     },
    # )

    # # Configuration for Dogecoin main net
    # DogecoinMainNet: CoinConf = CoinConf(
    #     coin_name=CoinNames("Dogecoin", "DOGE"),
    #     params={
    #         "p2pkh_net_ver": b"\x1e",
    #         "p2sh_net_ver": b"\x16",
    #         "wif_net_ver": b"\x9e",
    #     },
    # )

    # # Configuration for Dogecoin test net
    # DogecoinTestNet: CoinConf = CoinConf(
    #     coin_name=CoinNames("Dogecoin TestNet", "DOGE"),
    #     params={
    #         "p2pkh_net_ver": b"\x71",
    #         "p2sh_net_ver": _BTC_P2SH_NET_VER_TN,
    #         "wif_net_ver": b"\xf1",
    #     },
    # )

    # # Configuration for dYdX
    # DYDX: CoinConf = CoinConf(
    #     coin_name=CoinNames("dYdX", "DYDX"),
    #     params={
    #         "addr_hrp": Slip173.DYDX,
    #     },
    # )

    # # Configuration for eCash main net
    # EcashMainNet: CoinConf = CoinConf(
    #     coin_name=CoinNames("eCash", "XEC"),
    #     params={
    #         "p2pkh_std_hrp": "ecash",
    #         "p2pkh_std_net_ver": b"\x00",
    #         "p2pkh_legacy_net_ver": _BTC_P2PKH_NET_VER_MN,
    #         "p2sh_std_hrp": "ecash",
    #         "p2sh_std_net_ver": b"\x08",
    #         "p2sh_legacy_net_ver": _BTC_P2SH_NET_VER_MN,
    #         "wif_net_ver": _BTC_WIF_NET_VER_MN,
    #     },
    # )

    # # Configuration for eCash test net
    # EcashTestNet: CoinConf = CoinConf(
    #     coin_name=CoinNames("eCash TestNet", "XEC"),
    #     params={
    #         "p2pkh_std_hrp": "ectest",
    #         "p2pkh_std_net_ver": b"\x00",
    #         "p2pkh_legacy_net_ver": _BTC_P2PKH_NET_VER_TN,
    #         "p2sh_std_hrp": "ectest",
    #         "p2sh_std_net_ver": b"\x08",
    #         "p2sh_legacy_net_ver": _BTC_P2SH_NET_VER_TN,
    #         "wif_net_ver": _BTC_WIF_NET_VER_TN,
    #     },
    # )

    # # Configuration for Edgeware
    # Edgeware: CoinConf = CoinConf(
    #     coin_name=CoinNames("Edgeware", "EDG"),
    #     params={
    #         "addr_ss58_format": 7,
    #     },
    # )

    # # Configuration for Elrond
    # Elrond: CoinConf = CoinConf(
    #     coin_name=CoinNames("MultiversX", "EGLD"),
    #     params={
    #         "addr_hrp": Slip173.ELROND,
    #     },
    # )

    # # Configuration for Eos
    # Eos: CoinConf = CoinConf(
    #     coin_name=CoinNames("EOS", "EOS"),
    #     params={
    #         "addr_prefix": "EOS",
    #     },
    # )

    # # Configuration for Ergo main net
    # ErgoMainNet: CoinConf = CoinConf(
    #     coin_name=CoinNames("Ergo", "ERGO"),
    #     params={},
    # )

    # # Configuration for Ergo test net
    # ErgoTestNet: CoinConf = CoinConf(
    #     coin_name=CoinNames("Ergo TestNet", "ERGO"),
    #     params={},
    # )

    # # Configuration for Ethereum
    # Ethereum: CoinConf = CoinConf(
    #     coin_name=CoinNames("Ethereum", "ETH"),
    #     params={
    #         "addr_prefix": "0x",
    #     },
    # )

    # # Configuration for Ethereum Classic
    # EthereumClassic: CoinConf = CoinConf(
    #     coin_name=CoinNames("Ethereum Classic", "ETC"),
    #     params={},
    # )

    # # Configuration for Fantom Opera
    # FantomOpera: CoinConf = CoinConf(
    #     coin_name=CoinNames("Fantom Opera", "FTM"),
    #     params={},
    # )

    # # Configuration for Fetch.ai
    # FetchAi: CoinConf = CoinConf(
    #     coin_name=CoinNames("Fetch.ai", "FET"),
    #     params={
    #         "addr_hrp": Slip173.FETCH_AI,
    #     },
    # )

    # # Configuration for Filecoin
    # Filecoin: CoinConf = CoinConf(
    #     coin_name=CoinNames("Filecoin", "FIL"),
    #     params={
    #         "addr_prefix": "f",
    #     },
    # )

    # # Configuration for generic Substrate coin
    # GenericSubstrate: CoinConf = CoinConf(
    #     coin_name=CoinNames("Generic Substrate", ""),
    #     params={
    #         "addr_ss58_format": 42,
    #     },
    # )

    # # Configuration for Harmony One
    # HarmonyOne: CoinConf = CoinConf(
    #     coin_name=CoinNames("Harmony One", "ONE"),
    #     params={
    #         "addr_hrp": Slip173.HARMONY_ONE,
    #     },
    # )

    # # Configuration for Huobi Chain
    # HuobiChain: CoinConf = CoinConf(
    #     coin_name=CoinNames("Huobi Token", "HT"),
    #     params={},
    # )

    # # Configuration for Icon
    # Icon: CoinConf = CoinConf(
    #     coin_name=CoinNames("Icon", "ICX"),
    #     params={
    #         "addr_prefix": "hx",
    #     },
    # )

    # # Configuration for Injective
    # Injective: CoinConf = CoinConf(
    #     coin_name=CoinNames("Injective", "INJ"),
    #     params={
    #         "addr_hrp": Slip173.INJECTIVE,
    #     },
    # )

    # # Configuration for IRISnet
    # IrisNet: CoinConf = CoinConf(
    #     coin_name=CoinNames("IRIS Network", "IRIS"),
    #     params={
    #         "addr_hrp": Slip173.IRIS_NETWORK,
    #     },
    # )

    # # Configuration for Karura
    # Karura: CoinConf = CoinConf(
    #     coin_name=CoinNames("Karura", "KAR"),
    #     params={
    #         "addr_ss58_format": 8,
    #     },
    # )

    # # Configuration for Kava
    # Kava: CoinConf = CoinConf(
    #     coin_name=CoinNames("Kava", "KAVA"),
    #     params={
    #         "addr_hrp": Slip173.KAVA,
    #     },
    # )

    # # Configuration for Kusama
    # Kusama: CoinConf = CoinConf(
    #     coin_name=CoinNames("Kusama", "KSM"),
    #     params={
    #         "addr_ss58_format": 2,
    #     },
    # )

    # # Configuration for Litecoin main net
    # LitecoinMainNet: CoinConf = CoinConf(
    #     coin_name=CoinNames("Litecoin", "LTC"),
    #     params={
    #         "p2pkh_std_net_ver": b"\x30",
    #         "p2pkh_depr_net_ver": _BTC_P2PKH_NET_VER_MN,
    #         "p2sh_std_net_ver": b"\x32",
    #         "p2sh_depr_net_ver": _BTC_P2SH_NET_VER_MN,
    #         "p2wpkh_hrp": Slip173.LITECOIN_MAINNET,
    #         "p2wpkh_wit_ver": _BTC_P2WPKH_WIT_VER_MN,
    #         "wif_net_ver": b"\xb0",
    #     },
    # )

    # # Configuration for Litecoin test net
    # LitecoinTestNet: CoinConf = CoinConf(
    #     coin_name=CoinNames("Litecoin TestNet", "LTC"),
    #     params={
    #         "p2pkh_std_net_ver": b"\x6f",
    #         "p2pkh_depr_net_ver": _BTC_P2PKH_NET_VER_TN,
    #         "p2sh_std_net_ver": b"\x3a",
    #         "p2sh_depr_net_ver": _BTC_P2SH_NET_VER_TN,
    #         "p2wpkh_hrp": Slip173.LITECOIN_TESTNET,
    #         "p2wpkh_wit_ver": _BTC_P2WPKH_WIT_VER_TN,
    #         "wif_net_ver": _BTC_WIF_NET_VER_TN,
    #     },
    # )

    # # Configuration for Metis
    # Metis: CoinConf = CoinConf(
    #     coin_name=CoinNames("Metis", "METIS"),
    #     params={},
    # )

    # # Configuration for Monero main net
    # MoneroMainNet: CoinConf = CoinConf(
    #     coin_name=CoinNames("Monero", "XMR"),
    #     params={
    #         "addr_net_ver": b"\x12",
    #         "addr_int_net_ver": b"\x13",
    #         "subaddr_net_ver": b"\x2a",
    #     },
    # )

    # # Configuration for Monero stage net
    # MoneroStageNet: CoinConf = CoinConf(
    #     coin_name=CoinNames("Monero StageNet", "XMR"),
    #     params={
    #         "addr_net_ver": b"\x18",
    #         "addr_int_net_ver": b"\x19",
    #         "subaddr_net_ver": b"\x24",
    #     },
    # )

    # # Configuration for Monero test net
    # MoneroTestNet: CoinConf = CoinConf(
    #     coin_name=CoinNames("Monero TestNet", "XMR"),
    #     params={
    #         "addr_net_ver": b"\x35",
    #         "addr_int_net_ver": b"\x36",
    #         "subaddr_net_ver": b"\x3f",
    #     },
    # )

    # # Configuration for Moonbeam
    # Moonbeam: CoinConf = CoinConf(
    #     coin_name=CoinNames("Moonbeam", "GLMR"),
    #     params={
    #         "addr_ss58_format": 1284,
    #     },
    # )

    # # Configuration for Moonriver
    # Moonriver: CoinConf = CoinConf(
    #     coin_name=CoinNames("Moonriver", "MOVR"),
    #     params={
    #         "addr_ss58_format": 1285,
    #     },
    # )

    # # Configuration for Nano
    # Nano: CoinConf = CoinConf(
    #     coin_name=CoinNames("Nano", "NANO"),
    #     params={
    #         "addr_prefix": "nano_",
    #     },
    # )

    # # Configuration for Near Protocol
    # NearProtocol: CoinConf = CoinConf(
    #     coin_name=CoinNames("Near Protocol", "NEAR"),
    #     params={},
    # )

    # # For compatibility, later assigned to NeoLegacy
    # Neo: CoinConf

    # # Configuration for Neo legacy
    # NeoLegacy: CoinConf = CoinConf(
    #     coin_name=CoinNames("NEO", "NEO"),
    #     params={
    #         "addr_ver": b"\x17",
    #         "addr_prefix": b"\x21",
    #         "addr_suffix": b"\xac",
    #         "wif_net_ver": _BTC_WIF_NET_VER_MN,
    #     },
    # )

    # # Configuration for Neo N3
    # NeoN3: CoinConf = CoinConf(
    #     coin_name=CoinNames("NEO", "NEO"),
    #     params={
    #         "addr_ver": b"\x35",
    #         "addr_prefix": b"\x0c\x21",
    #         "addr_suffix": b"\x41\x56\xe7\xb3\x27",
    #         "wif_net_ver": _BTC_WIF_NET_VER_MN,
    #     },
    # )

    # # Configuration for Neutron
    # Neutron: CoinConf = CoinConf(
    #     coin_name=CoinNames("Neutron", "NTRN"),
    #     params={
    #         "addr_hrp": Slip173.NEUTRON,
    #     },
    # )

    # # Configuration for Nimiq
    # Nimiq: CoinConf = CoinConf(
    #     coin_name=CoinNames("Nimiq", "NIM"),
    #     params={
    #         "addr_prefix": "NQ"
    #     },
    # )

    # # Configuration for Nine Chronicles Gold
    # NineChroniclesGold: CoinConf = CoinConf(
    #     coin_name=CoinNames("NineChroniclesGold", "NCG"),
    #     params={},
    # )

    # # Configuration for OKEx Chain
    # OkexChain: CoinConf = CoinConf(
    #     coin_name=CoinNames("OKExChain", "OKT"),
    #     params={
    #         "addr_hrp": Slip173.OKEX_CHAIN,
    #     },
    # )

    # # Configuration for Ontology
    # Ontology: CoinConf = CoinConf(
    #     coin_name=CoinNames("Ontology", "ONT"),
    #     params={
    #         "addr_ver": b"\x17",
    #     },
    # )

    # # Configuration for Optimism
    # Optimism: CoinConf = CoinConf(
    #     coin_name=CoinNames("Optimism", "OP"),
    #     params={},
    # )

    # # Configuration for Osmosis
    # Osmosis: CoinConf = CoinConf(
    #     coin_name=CoinNames("Osmosis", "OSMO"),
    #     params={
    #         "addr_hrp": Slip173.OSMOSIS,
    #     },
    # )

    # # Configuration for Phala
    # Phala: CoinConf = CoinConf(
    #     coin_name=CoinNames("Phala Network", "PHA"),
    #     params={
    #         "addr_ss58_format": 30,
    #     },
    # )

    # # Configuration for Pi Network
    # PiNetwork: CoinConf = CoinConf(
    #     coin_name=CoinNames("Pi Network", "PI"),
    #     params={},
    # )

    # # Configuration for Plasm
    # Plasm: CoinConf = CoinConf(
    #     coin_name=CoinNames("Plasm Network", "PLM"),
    #     params={
    #         "addr_ss58_format": 5,
    #     },
    # )

    # # Configuration for Polkadot
    # Polkadot: CoinConf = CoinConf(
    #     coin_name=CoinNames("Polkadot", "DOT"),
    #     params={
    #         "addr_ss58_format": 0,
    #     },
    # )

    # # Configuration for Polygon
    # Polygon: CoinConf = CoinConf(
    #     coin_name=CoinNames("Polygon", "MATIC"),
    #     params={},
    # )

    # # Configuration for Ripple
    # Ripple: CoinConf = CoinConf(
    #     coin_name=CoinNames("Ripple", "XRP"),
    #     params={
    #         "p2pkh_net_ver": _BTC_P2PKH_NET_VER_MN,
    #     },
    # )

    # # Configuration for Secret Network
    # SecretNetwork: CoinConf = CoinConf(
    #     coin_name=CoinNames("Secret Network", "SCRT"),
    #     params={
    #         "addr_hrp": Slip173.SECRET_NETWORK,
    #     },
    # )

    # # Configuration for Solana
    # Solana: CoinConf = CoinConf(
    #     coin_name=CoinNames("Solana", "SOL"),
    #     params={},
    # )

    # # Configuration for Sora
    # Sora: CoinConf = CoinConf(
    #     coin_name=CoinNames("Sora", "XOR"),
    #     params={
    #         "addr_ss58_format": 69,
    #     },
    # )

    # # Configuration for Stafi
    # Stafi: CoinConf = CoinConf(
    #     coin_name=CoinNames("Stafi", "FIS"),
    #     params={
    #         "addr_hrp": Slip173.STAFI,
    #         "addr_ss58_format": 20,
    #     },
    # )

    # # Configuration for Stellar
    # Stellar: CoinConf = CoinConf(
    #     coin_name=CoinNames("Stellar", "XLM"),
    #     params={},
    # )

    # # Configuration for Sui
    # Sui: CoinConf = CoinConf(
    #     coin_name=CoinNames("Sui", "SUI"),
    #     params={
    #         "addr_prefix": "0x",
    #     },
    # )

    # # Configuration for Terra
    # Terra: CoinConf = CoinConf(
    #     coin_name=CoinNames("Terra", "LUNA"),
    #     params={
    #         "addr_hrp": Slip173.TERRA,
    #     },
    # )

    # # Configuration for Tezos
    # Tezos: CoinConf = CoinConf(
    #     coin_name=CoinNames("Tezos", "XTZ"),
    #     params={},
    # )

    # # Configuration for Theta
    # Theta: CoinConf = CoinConf(
    #     coin_name=CoinNames("Theta Network", "THETA"),
    #     params={},
    # )

    # # Configuration for Tron
    # Tron: CoinConf = CoinConf(
    #     coin_name=CoinNames("Tron", "TRX"),
    #     params={
    #         "addr_prefix": b"\x41",
    #     },
    # )

    # # Configuration for VeChain
    # VeChain: CoinConf = CoinConf(
    #     coin_name=CoinNames("VeChain", "VET"),
    #     params={},
    # )

    # # Configuration for Verge
    # Verge: CoinConf = CoinConf(
    #     coin_name=CoinNames("Verge", "XVG"),
    #     params={
    #         "p2pkh_net_ver": b"\x1e",
    #         "wif_net_ver": b"\x9e",
    #     },
    # )

    # # Configuration for Zcash main net
    # ZcashMainNet: CoinConf = CoinConf(
    #     coin_name=CoinNames("Zcash", "ZEC"),
    #     params={
    #         "p2pkh_net_ver": b"\x1c\xb8",
    #         "p2sh_net_ver": b"\x1c\xbd",
    #         "wif_net_ver": _BTC_WIF_NET_VER_MN,
    #     },
    # )

    # # Configuration for Zcash test net
    # ZcashTestNet: CoinConf = CoinConf(
    #     coin_name=CoinNames("Zcash TestNet", "ZEC"),
    #     params={
    #         "p2pkh_net_ver": b"\x1d\x25",
    #         "p2sh_net_ver": b"\x1c\xba",
    #         "wif_net_ver": _BTC_WIF_NET_VER_TN,
    #     },
    # )

    # # Configuration for Zilliqa
    # Zilliqa: CoinConf = CoinConf(
    #     coin_name=CoinNames("Zilliqa", "ZIL"),
    #     params={
    #         "addr_hrp": Slip173.ZILLIQA,
    #     },
    # )


# For compatibility
# CoinsConf.Neo = CoinsConf.NeoLegacy
