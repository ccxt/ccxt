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

"""Module for BIP44 coins configuration."""

# Imports
from ..addr import (
    AdaByronIcarusAddrEncoder, AlgoAddrEncoder, AptosAddrEncoder, AtomAddrEncoder, AvaxPChainAddrEncoder,
    AvaxXChainAddrEncoder, BchP2PKHAddrEncoder, EgldAddrEncoder, EosAddrEncoder, ErgoNetworkTypes, ErgoP2PKHAddrEncoder,
    EthAddrEncoder, FilSecp256k1AddrEncoder, IcxAddrEncoder, InjAddrEncoder, NanoAddrEncoder, NearAddrEncoder,
    NeoLegacyAddrEncoder, NeoN3AddrEncoder, NimAddrEncoder, OkexAddrEncoder, OneAddrEncoder, P2PKHAddrEncoder,
    SolAddrEncoder, SubstrateEd25519AddrEncoder, SuiAddrEncoder, TrxAddrEncoder, XlmAddrEncoder, XlmAddrTypes,
    XmrAddrEncoder, XrpAddrEncoder, XtzAddrEncoder, XtzAddrPrefixes, ZilAddrEncoder
)
from ..bip32 import (
    Bip32Const, Bip32KeyNetVersions, Bip32Slip10Ed25519, Bip32Slip10Ed25519Blake2b,
    Bip32Slip10Nist256p1, Bip32Slip10Secp256k1
    # Bip32KholawEd25519
)
# from  import (
#     DER_PATH_HARDENED_FULL, DER_PATH_HARDENED_MID, DER_PATH_HARDENED_SHORT, DER_PATH_NON_HARDENED_FULL,
#     BipBitcoinCashConf, BipCoinConf, BipCoinFctCallsConf, BipLitecoinConf
# )
# from bip_utils.cardano.bip32.cardano_icarus_bip32 import CardanoIcarusBip32
from ..coin_conf import CoinsConf
from ..slip.slip44 import Slip44


# Bitcoin key net version for main net (same as BIP32)
_BIP44_BTC_KEY_NET_VER_MAIN: Bip32KeyNetVersions = Bip32Const.MAIN_NET_KEY_NET_VERSIONS
# Bitcoin key net version for test net (same as BIP32)
_BIP44_BTC_KEY_NET_VER_TEST: Bip32KeyNetVersions = Bip32Const.TEST_NET_KEY_NET_VERSIONS


class Bip44Conf:
    """Class container for BIP44 configuration."""

    # Configuration for Akash Network
    AkashNetwork: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.AkashNetwork.CoinNames(),
        coin_idx=Slip44.ATOM,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=None,
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=AtomAddrEncoder,
        addr_params={
            "hrp": CoinsConf.AkashNetwork.ParamByKey("addr_hrp"),
        },
    )

    # Configuration for Algorand
    Algorand: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.Algorand.CoinNames(),
        coin_idx=Slip44.ALGORAND,
        is_testnet=False,
        def_path=DER_PATH_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=None,
        bip32_cls=Bip32Slip10Ed25519,
        addr_cls=AlgoAddrEncoder,
        addr_params={},
    )

    # Configuration for Aptos
    Aptos: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.Aptos.CoinNames(),
        coin_idx=Slip44.APTOS,
        is_testnet=False,
        def_path=DER_PATH_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=None,
        bip32_cls=Bip32Slip10Ed25519,
        addr_cls=AptosAddrEncoder,
        addr_params={},
    )

    # Configuration for Arbitrum
    Arbitrum: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.Arbitrum.CoinNames(),
        coin_idx=Slip44.ETHEREUM,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=None,
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=EthAddrEncoder,
        addr_params={},
    )

    # Configuration for Avax C-Chain
    AvaxCChain: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.AvaxCChain.CoinNames(),
        coin_idx=Slip44.ETHEREUM,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=None,
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=EthAddrEncoder,
        addr_params={},
    )
    # Configuration for Avax P-Chain
    AvaxPChain: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.AvaxPChain.CoinNames(),
        coin_idx=Slip44.AVALANCHE,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=None,
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=AvaxPChainAddrEncoder,
        addr_params={},
    )
    # Configuration for Avax X-Chain
    AvaxXChain: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.AvaxXChain.CoinNames(),
        coin_idx=Slip44.AVALANCHE,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=None,
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=AvaxXChainAddrEncoder,
        addr_params={},
    )

    # Configuration for Axelar
    Axelar: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.Axelar.CoinNames(),
        coin_idx=Slip44.ATOM,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=None,
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=AtomAddrEncoder,
        addr_params={
            "hrp": CoinsConf.Axelar.ParamByKey("addr_hrp"),
        },
    )

    # Configuration for Band Protocol
    BandProtocol: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.BandProtocol.CoinNames(),
        coin_idx=Slip44.BAND_PROTOCOL,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=None,
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=AtomAddrEncoder,
        addr_params={
            "hrp": CoinsConf.BandProtocol.ParamByKey("addr_hrp"),
        },
    )

    # Configuration for Binance Chain
    BinanceChain: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.BinanceChain.CoinNames(),
        coin_idx=Slip44.BINANCE_CHAIN,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=None,
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=AtomAddrEncoder,
        addr_params={
            "hrp": CoinsConf.BinanceChain.ParamByKey("addr_hrp"),
        },
    )
    # Configuration for Binance Smart Chain
    BinanceSmartChain: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.BinanceSmartChain.CoinNames(),
        coin_idx=Slip44.ETHEREUM,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=None,
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=EthAddrEncoder,
        addr_params={},
    )

    # Configuration for Bitcoin main net
    BitcoinMainNet: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.BitcoinMainNet.CoinNames(),
        coin_idx=Slip44.BITCOIN,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=CoinsConf.BitcoinMainNet.ParamByKey("wif_net_ver"),
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=P2PKHAddrEncoder,
        addr_params={
            "net_ver": CoinsConf.BitcoinMainNet.ParamByKey("p2pkh_net_ver"),
        },
    )
    # Configuration for Bitcoin regtest
    BitcoinRegTest: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.BitcoinRegTest.CoinNames(),
        coin_idx=Slip44.TESTNET,
        is_testnet=True,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_TEST,
        wif_net_ver=CoinsConf.BitcoinRegTest.ParamByKey("wif_net_ver"),
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=P2PKHAddrEncoder,
        addr_params={
            "net_ver": CoinsConf.BitcoinRegTest.ParamByKey("p2pkh_net_ver"),
        },
    )

    # Configuration for Bitcoin test net
    BitcoinTestNet: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.BitcoinTestNet.CoinNames(),
        coin_idx=Slip44.TESTNET,
        is_testnet=True,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_TEST,
        wif_net_ver=CoinsConf.BitcoinTestNet.ParamByKey("wif_net_ver"),
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=P2PKHAddrEncoder,
        addr_params={
            "net_ver": CoinsConf.BitcoinTestNet.ParamByKey("p2pkh_net_ver"),
        },
    )

    # Configuration for Bitcoin Cash main net
    BitcoinCashMainNet: BipBitcoinCashConf = BipBitcoinCashConf(
        coin_names=CoinsConf.BitcoinCashMainNet.CoinNames(),
        coin_idx=Slip44.BITCOIN_CASH,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=CoinsConf.BitcoinCashMainNet.ParamByKey("wif_net_ver"),
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=BchP2PKHAddrEncoder,
        addr_params={
            "std": {
                "net_ver": CoinsConf.BitcoinCashMainNet.ParamByKey("p2pkh_std_net_ver"),
                "hrp": CoinsConf.BitcoinCashMainNet.ParamByKey("p2pkh_std_hrp"),
            },
            "legacy": {
                "net_ver": CoinsConf.BitcoinCashMainNet.ParamByKey("p2pkh_legacy_net_ver"),
            }
        },
        addr_cls_legacy=P2PKHAddrEncoder,
    )
    # Configuration for Bitcoin Cash test net
    BitcoinCashTestNet: BipBitcoinCashConf = BipBitcoinCashConf(
        coin_names=CoinsConf.BitcoinCashTestNet.CoinNames(),
        coin_idx=Slip44.TESTNET,
        is_testnet=True,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_TEST,
        wif_net_ver=CoinsConf.BitcoinCashTestNet.ParamByKey("wif_net_ver"),
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=BchP2PKHAddrEncoder,
        addr_params={
            "std": {
                "net_ver": CoinsConf.BitcoinCashTestNet.ParamByKey("p2pkh_std_net_ver"),
                "hrp": CoinsConf.BitcoinCashTestNet.ParamByKey("p2pkh_std_hrp"),
            },
            "legacy": {
                "net_ver": CoinsConf.BitcoinCashTestNet.ParamByKey("p2pkh_legacy_net_ver"),
            }
        },
        addr_cls_legacy=P2PKHAddrEncoder,
    )

    # Configuration for Bitcoin Cash Simple Ledger Protocol main net
    BitcoinCashSlpMainNet: BipBitcoinCashConf = BipBitcoinCashConf(
        coin_names=CoinsConf.BitcoinCashSlpMainNet.CoinNames(),
        coin_idx=Slip44.BITCOIN_CASH,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=CoinsConf.BitcoinCashSlpMainNet.ParamByKey("wif_net_ver"),
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=BchP2PKHAddrEncoder,
        addr_params={
            "std": {
                "net_ver": CoinsConf.BitcoinCashSlpMainNet.ParamByKey("p2pkh_std_net_ver"),
                "hrp": CoinsConf.BitcoinCashSlpMainNet.ParamByKey("p2pkh_std_hrp"),
            },
            "legacy": {
                "net_ver": CoinsConf.BitcoinCashSlpMainNet.ParamByKey("p2pkh_legacy_net_ver"),
            }
        },
        addr_cls_legacy=P2PKHAddrEncoder,
    )
    # Configuration for Bitcoin Cash Simple Ledger Protocol test net
    BitcoinCashSlpTestNet: BipBitcoinCashConf = BipBitcoinCashConf(
        coin_names=CoinsConf.BitcoinCashSlpTestNet.CoinNames(),
        coin_idx=Slip44.TESTNET,
        is_testnet=True,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_TEST,
        wif_net_ver=CoinsConf.BitcoinCashSlpTestNet.ParamByKey("wif_net_ver"),
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=BchP2PKHAddrEncoder,
        addr_params={
            "std": {
                "net_ver": CoinsConf.BitcoinCashSlpTestNet.ParamByKey("p2pkh_std_net_ver"),
                "hrp": CoinsConf.BitcoinCashSlpTestNet.ParamByKey("p2pkh_std_hrp"),
            },
            "legacy": {
                "net_ver": CoinsConf.BitcoinCashSlpTestNet.ParamByKey("p2pkh_legacy_net_ver"),
            }
        },
        addr_cls_legacy=P2PKHAddrEncoder,
    )

    # Configuration for BitcoinSV main net
    BitcoinSvMainNet: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.BitcoinSvMainNet.CoinNames(),
        coin_idx=Slip44.BITCOIN_SV,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=CoinsConf.BitcoinSvMainNet.ParamByKey("wif_net_ver"),
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=P2PKHAddrEncoder,
        addr_params={
            "net_ver": CoinsConf.BitcoinSvMainNet.ParamByKey("p2pkh_net_ver"),
        },
    )
    # Configuration for BitcoinSV test net
    BitcoinSvTestNet: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.BitcoinSvTestNet.CoinNames(),
        coin_idx=Slip44.TESTNET,
        is_testnet=True,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_TEST,
        wif_net_ver=CoinsConf.BitcoinSvTestNet.ParamByKey("wif_net_ver"),
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=P2PKHAddrEncoder,
        addr_params={
            "net_ver": CoinsConf.BitcoinSvTestNet.ParamByKey("p2pkh_net_ver"),
        },
    )

    # Configuration for Cardano Byron (Icarus)
    # CardanoByronIcarus: BipCoinConf = BipCoinConf(
    #     coin_names=CoinsConf.CardanoMainNet.CoinNames(),
    #     coin_idx=Slip44.CARDANO,
    #     is_testnet=False,
    #     def_path=DER_PATH_NON_HARDENED_FULL,
    #     key_net_ver=Bip32Const.KHOLAW_KEY_NET_VERSIONS,
    #     wif_net_ver=None,
    #     bip32_cls=CardanoIcarusBip32,
    #     addr_cls=AdaByronIcarusAddrEncoder,
    #     addr_params={
    #         "chain_code": BipCoinFctCallsConf("ChainCode"),
    #     },
    # )
    # Configuration for Cardano Byron (Ledger)
    CardanoByronLedger: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.CardanoMainNet.CoinNames(),
        coin_idx=Slip44.CARDANO,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=Bip32Const.KHOLAW_KEY_NET_VERSIONS,
        wif_net_ver=None,
        bip32_cls=Bip32KholawEd25519,
        addr_cls=AdaByronIcarusAddrEncoder,
        addr_params={
            "chain_code": BipCoinFctCallsConf("ChainCode"),
        },
    )

    # Configuration for Celestia
    Celestia: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.Celestia.CoinNames(),
        coin_idx=Slip44.ATOM,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=None,
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=AtomAddrEncoder,
        addr_params={
            "hrp": CoinsConf.Celestia.ParamByKey("addr_hrp"),
        },
    )

    # Configuration for Celo
    Celo: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.Celo.CoinNames(),
        coin_idx=Slip44.CELO,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=None,
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=EthAddrEncoder,
        addr_params={},
    )

    # Configuration for Certik
    Certik: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.Certik.CoinNames(),
        coin_idx=Slip44.ATOM,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=None,
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=AtomAddrEncoder,
        addr_params={
            "hrp": CoinsConf.Certik.ParamByKey("addr_hrp"),
        },
    )

    # Configuration for Chihuahua
    Chihuahua: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.Chihuahua.CoinNames(),
        coin_idx=Slip44.ATOM,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=None,
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=AtomAddrEncoder,
        addr_params={
            "hrp": CoinsConf.Chihuahua.ParamByKey("addr_hrp"),
        },
    )

    # Configuration for Cosmos
    Cosmos: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.Cosmos.CoinNames(),
        coin_idx=Slip44.ATOM,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=None,
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=AtomAddrEncoder,
        addr_params={
            "hrp": CoinsConf.Cosmos.ParamByKey("addr_hrp"),
        },
    )

    # Configuration for Dash main net
    DashMainNet: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.DashMainNet.CoinNames(),
        coin_idx=Slip44.DASH,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=CoinsConf.DashMainNet.ParamByKey("wif_net_ver"),
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=P2PKHAddrEncoder,
        addr_params={
            "net_ver": CoinsConf.DashMainNet.ParamByKey("p2pkh_net_ver"),
        },
    )
    # Configuration for Dash test net
    DashTestNet: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.DashTestNet.CoinNames(),
        coin_idx=Slip44.TESTNET,
        is_testnet=True,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_TEST,
        wif_net_ver=CoinsConf.DashTestNet.ParamByKey("wif_net_ver"),
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=P2PKHAddrEncoder,
        addr_params={
            "net_ver": CoinsConf.DashTestNet.ParamByKey("p2pkh_net_ver"),
        },
    )

    # Configuration for Dogecoin main net
    DogecoinMainNet: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.DogecoinMainNet.CoinNames(),
        coin_idx=Slip44.DOGECOIN,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=Bip32KeyNetVersions(b"\x02\xfa\xca\xfd",
                                        b"\x02\xfa\xc3\x98"),   # dgub / dgpv
        wif_net_ver=CoinsConf.DogecoinMainNet.ParamByKey("wif_net_ver"),
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=P2PKHAddrEncoder,
        addr_params={
            "net_ver": CoinsConf.DogecoinMainNet.ParamByKey("p2pkh_net_ver"),
        },
    )
    # Configuration for Dogecoin test net
    DogecoinTestNet: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.DogecoinTestNet.CoinNames(),
        coin_idx=Slip44.TESTNET,
        is_testnet=True,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=Bip32KeyNetVersions(b"\x04\x32\xa9\xa8",
                                        b"\x04\x32\xa2\x43"),   # tgub / tgpv
        wif_net_ver=CoinsConf.DogecoinTestNet.ParamByKey("wif_net_ver"),
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=P2PKHAddrEncoder,
        addr_params={
            "net_ver": CoinsConf.DogecoinTestNet.ParamByKey("p2pkh_net_ver"),
        },
    )

    # Configuration for dYdX
    DYDX: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.DYDX.CoinNames(),
        coin_idx=Slip44.ATOM,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=None,
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=AtomAddrEncoder,
        addr_params={
            "hrp": CoinsConf.DYDX.ParamByKey("addr_hrp"),
        },
    )

    # Configuration for eCash main net
    EcashMainNet: BipBitcoinCashConf = BipBitcoinCashConf(
        coin_names=CoinsConf.EcashMainNet.CoinNames(),
        coin_idx=Slip44.BITCOIN_CASH,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=CoinsConf.EcashMainNet.ParamByKey("wif_net_ver"),
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=BchP2PKHAddrEncoder,
        addr_params={
            "std": {
                "net_ver": CoinsConf.EcashMainNet.ParamByKey("p2pkh_std_net_ver"),
                "hrp": CoinsConf.EcashMainNet.ParamByKey("p2pkh_std_hrp"),
            },
            "legacy": {
                "net_ver": CoinsConf.EcashMainNet.ParamByKey("p2pkh_legacy_net_ver"),
            }
        },
        addr_cls_legacy=P2PKHAddrEncoder,
    )
    # Configuration for eCash test net
    EcashTestNet: BipBitcoinCashConf = BipBitcoinCashConf(
        coin_names=CoinsConf.EcashTestNet.CoinNames(),
        coin_idx=Slip44.TESTNET,
        is_testnet=True,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_TEST,
        wif_net_ver=CoinsConf.EcashTestNet.ParamByKey("wif_net_ver"),
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=BchP2PKHAddrEncoder,
        addr_params={
            "std": {
                "net_ver": CoinsConf.EcashTestNet.ParamByKey("p2pkh_std_net_ver"),
                "hrp": CoinsConf.EcashTestNet.ParamByKey("p2pkh_std_hrp"),
            },
            "legacy": {
                "net_ver": CoinsConf.EcashTestNet.ParamByKey("p2pkh_legacy_net_ver"),
            }
        },
        addr_cls_legacy=P2PKHAddrEncoder,
    )

    # Configuration for Elrond
    Elrond: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.Elrond.CoinNames(),
        coin_idx=Slip44.ELROND,
        is_testnet=False,
        def_path=DER_PATH_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=None,
        bip32_cls=Bip32Slip10Ed25519,
        addr_cls=EgldAddrEncoder,
        addr_params={},
    )

    # Configuration for Eos
    Eos: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.Eos.CoinNames(),
        coin_idx=Slip44.EOS,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=None,
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=EosAddrEncoder,
        addr_params={},
    )

    # Configuration for Ergo main net
    ErgoMainNet: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.ErgoMainNet.CoinNames(),
        coin_idx=Slip44.ERGO,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=None,
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=ErgoP2PKHAddrEncoder,
        addr_params={
            "net_type": ErgoNetworkTypes.MAINNET,
        },
    )

    # Configuration for Ergo test net
    ErgoTestNet: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.ErgoTestNet.CoinNames(),
        coin_idx=Slip44.ERGO,
        is_testnet=True,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_TEST,
        wif_net_ver=None,
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=ErgoP2PKHAddrEncoder,
        addr_params={
            "net_type": ErgoNetworkTypes.TESTNET,
        },
    )

    # Configuration for Ethereum
    Ethereum: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.Ethereum.CoinNames(),
        coin_idx=Slip44.ETHEREUM,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=None,
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=EthAddrEncoder,
        addr_params={},
    )
    # Configuration for Ethereum Classic
    EthereumClassic: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.EthereumClassic.CoinNames(),
        coin_idx=Slip44.ETHEREUM_CLASSIC,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=None,
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=EthAddrEncoder,
        addr_params={},
    )

    # Configuration for Fantom Opera
    FantomOpera: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.FantomOpera.CoinNames(),
        coin_idx=Slip44.ETHEREUM,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=None,
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=EthAddrEncoder,
        addr_params={},
    )

    # Configuration for Fetch.ai
    FetchAi: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.FetchAi.CoinNames(),
        coin_idx=Slip44.ATOM,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=None,
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=AtomAddrEncoder,
        addr_params={
            "hrp": CoinsConf.FetchAi.ParamByKey("addr_hrp"),
        },
    )

    # Configuration for Fetch.ai (ETH)
    FetchAiEth: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.FetchAi.CoinNames(),
        coin_idx=Slip44.ETHEREUM,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=None,
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=AtomAddrEncoder,
        addr_params={
            "hrp": CoinsConf.FetchAi.ParamByKey("addr_hrp"),
        },
    )

    # Configuration for Filecoin
    Filecoin: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.Filecoin.CoinNames(),
        coin_idx=Slip44.FILECOIN,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=None,
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=FilSecp256k1AddrEncoder,
        addr_params={},
    )

    # Configuration for Harmony One (Metamask address)
    HarmonyOneMetamask: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.HarmonyOne.CoinNames(),
        coin_idx=Slip44.ETHEREUM,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=None,
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=EthAddrEncoder,
        addr_params={},
    )
    # Configuration for Harmony One (Ethereum address)
    HarmonyOneEth: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.HarmonyOne.CoinNames(),
        coin_idx=Slip44.HARMONY_ONE,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=None,
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=EthAddrEncoder,
        addr_params={},
    )
    # Configuration for Harmony One (Atom address)
    HarmonyOneAtom: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.HarmonyOne.CoinNames(),
        coin_idx=Slip44.HARMONY_ONE,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=None,
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=OneAddrEncoder,
        addr_params={},
    )

    # Configuration for Huobi Chain
    HuobiChain: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.HuobiChain.CoinNames(),
        coin_idx=Slip44.ETHEREUM,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=None,
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=EthAddrEncoder,
        addr_params={},
    )

    # Configuration for Icon
    Icon: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.Icon.CoinNames(),
        coin_idx=Slip44.ICON,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=None,
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=IcxAddrEncoder,
        addr_params={},
    )

    # Configuration for Injective
    Injective: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.Injective.CoinNames(),
        coin_idx=Slip44.ETHEREUM,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=None,
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=InjAddrEncoder,
        addr_params={},
    )

    # Configuration for IRISnet
    IrisNet: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.IrisNet.CoinNames(),
        coin_idx=Slip44.ATOM,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=None,
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=AtomAddrEncoder,
        addr_params={
            "hrp": CoinsConf.IrisNet.ParamByKey("addr_hrp"),
        },
    )

    # Configuration for Kava
    Kava: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.Kava.CoinNames(),
        coin_idx=Slip44.KAVA,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=None,
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=AtomAddrEncoder,
        addr_params={
            "hrp": CoinsConf.Kava.ParamByKey("addr_hrp"),
        },
    )

    # Configuration for Kusama (ed25519 SLIP-0010)
    KusamaEd25519Slip: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.Kusama.CoinNames(),
        coin_idx=Slip44.KUSAMA,
        is_testnet=False,
        def_path=DER_PATH_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=None,
        bip32_cls=Bip32Slip10Ed25519,
        addr_cls=SubstrateEd25519AddrEncoder,
        addr_params={
            "ss58_format": CoinsConf.Kusama.ParamByKey("addr_ss58_format"),
        },
    )

    # Configuration for Litecoin main net
    LitecoinMainNet: BipLitecoinConf = BipLitecoinConf(
        coin_names=CoinsConf.LitecoinMainNet.CoinNames(),
        coin_idx=Slip44.LITECOIN,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        alt_key_net_ver=Bip32KeyNetVersions(b"\x01\x9d\xa4\x62",
                                            b"\x01\x9d\x9c\xfe"),   # Ltpv / Ltub
        wif_net_ver=CoinsConf.LitecoinMainNet.ParamByKey("wif_net_ver"),
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=P2PKHAddrEncoder,
        addr_params={
            "std_net_ver": CoinsConf.LitecoinMainNet.ParamByKey("p2pkh_std_net_ver"),
            "depr_net_ver": CoinsConf.LitecoinMainNet.ParamByKey("p2pkh_depr_net_ver"),
        },
    )
    # Configuration for Litecoin test net
    LitecoinTestNet: BipLitecoinConf = BipLitecoinConf(
        coin_names=CoinsConf.LitecoinTestNet.CoinNames(),
        coin_idx=Slip44.TESTNET,
        is_testnet=True,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=Bip32KeyNetVersions(b"\x04\x36\xf6\xe1",
                                        b"\x04\x36\xef\x7d"),       # ttub / ttpv
        alt_key_net_ver=Bip32KeyNetVersions(b"\x04\x36\xf6\xe1",
                                            b"\x04\x36\xef\x7d"),   # ttub / ttpv
        wif_net_ver=CoinsConf.LitecoinTestNet.ParamByKey("wif_net_ver"),
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=P2PKHAddrEncoder,
        addr_params={
            "std_net_ver": CoinsConf.LitecoinTestNet.ParamByKey("p2pkh_std_net_ver"),
            "depr_net_ver": CoinsConf.LitecoinTestNet.ParamByKey("p2pkh_depr_net_ver"),
        },
    )

    # Configuration for Metis
    Metis: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.Metis.CoinNames(),
        coin_idx=Slip44.ETHEREUM,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=None,
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=EthAddrEncoder,
        addr_params={},
    )

    # Configuration for Monero (ed25519 SLIP-0010)
    MoneroEd25519Slip: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.MoneroMainNet.CoinNames(),
        coin_idx=Slip44.MONERO,
        is_testnet=False,
        def_path=DER_PATH_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=None,
        bip32_cls=Bip32Slip10Ed25519,
        addr_cls=XmrAddrEncoder,
        addr_params={},
    )

    # Configuration for Monero (secp256k1)
    MoneroSecp256k1: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.MoneroMainNet.CoinNames(),
        coin_idx=Slip44.MONERO,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=None,
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=XmrAddrEncoder,
        addr_params={},
    )

    # Configuration for Nano
    Nano: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.Nano.CoinNames(),
        coin_idx=Slip44.NANO,
        is_testnet=False,
        def_path=DER_PATH_HARDENED_SHORT,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=None,
        bip32_cls=Bip32Slip10Ed25519Blake2b,
        addr_cls=NanoAddrEncoder,
        addr_params={},
    )

    # Configuration for Near Protocol
    NearProtocol: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.NearProtocol.CoinNames(),
        coin_idx=Slip44.NEAR_PROTOCOL,
        is_testnet=False,
        def_path=DER_PATH_HARDENED_SHORT,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=None,
        bip32_cls=Bip32Slip10Ed25519,
        addr_cls=NearAddrEncoder,
        addr_params={},
    )

    # For compatibility, later assigned to NeoLegacy
    Neo: BipCoinConf

    # Configuration for Neo legacy
    NeoLegacy: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.NeoLegacy.CoinNames(),
        coin_idx=Slip44.NEO,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=CoinsConf.NeoLegacy.ParamByKey("wif_net_ver"),
        bip32_cls=Bip32Slip10Nist256p1,
        addr_cls=NeoLegacyAddrEncoder,
        addr_params={
            "ver": CoinsConf.NeoLegacy.ParamByKey("addr_ver"),
        },
    )

    # Configuration for Neo N3
    NeoN3: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.NeoN3.CoinNames(),
        coin_idx=Slip44.NEO,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=CoinsConf.NeoN3.ParamByKey("wif_net_ver"),
        bip32_cls=Bip32Slip10Nist256p1,
        addr_cls=NeoN3AddrEncoder,
        addr_params={
            "ver": CoinsConf.NeoN3.ParamByKey("addr_ver"),
        },
    )

    # Configuration for Neutron
    Neutron: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.Neutron.CoinNames(),
        coin_idx=Slip44.ATOM,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=None,
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=AtomAddrEncoder,
        addr_params={
            "hrp": CoinsConf.Neutron.ParamByKey("addr_hrp"),
        },
    )

    # Configuration for Nimiq
    Nimiq: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.Nimiq.CoinNames(),
        coin_idx=Slip44.NIMIQ,
        is_testnet=False,
        def_path=DER_PATH_HARDENED_MID,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=None,
        bip32_cls=Bip32Slip10Ed25519,
        addr_cls=NimAddrEncoder,
        addr_params={},
    )

    # Configuration for NG
    NineChroniclesGold: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.NineChroniclesGold.CoinNames(),
        coin_idx=Slip44.NINE_CHRONICLES,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=None,
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=EthAddrEncoder,
        addr_params={},
    )

    # Configuration for OKEx Chain (Ethereum address)
    OkexChainEth: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.OkexChain.CoinNames(),
        coin_idx=Slip44.ETHEREUM,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=None,
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=EthAddrEncoder,
        addr_params={},
    )

    # Configuration for OKEx Chain (Atom address)
    OkexChainAtom: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.OkexChain.CoinNames(),
        coin_idx=Slip44.ETHEREUM,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=None,
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=OkexAddrEncoder,
        addr_params={},
    )

    # Configuration for OKEx Chain (old Atom address)
    OkexChainAtomOld: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.OkexChain.CoinNames(),
        coin_idx=Slip44.OKEX_CHAIN,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=None,
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=OkexAddrEncoder,
        addr_params={},
    )

    # Configuration for Ontology
    Ontology: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.Ontology.CoinNames(),
        coin_idx=Slip44.ONTOLOGY,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=None,
        bip32_cls=Bip32Slip10Nist256p1,
        addr_cls=NeoLegacyAddrEncoder,
        addr_params={
            "ver": CoinsConf.Ontology.ParamByKey("addr_ver"),
        },
    )

    # Configuration for Optimism
    Optimism: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.Optimism.CoinNames(),
        coin_idx=Slip44.ETHEREUM,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=None,
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=EthAddrEncoder,
        addr_params={},
    )

    # Configuration for Osmosis
    Osmosis: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.Osmosis.CoinNames(),
        coin_idx=Slip44.ATOM,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=None,
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=AtomAddrEncoder,
        addr_params={
            "hrp": CoinsConf.Osmosis.ParamByKey("addr_hrp"),
        },
    )

    # Configuration for Pi Network
    PiNetwork: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.PiNetwork.CoinNames(),
        coin_idx=Slip44.PI_NETWORK,
        is_testnet=False,
        def_path=DER_PATH_HARDENED_SHORT,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=None,
        bip32_cls=Bip32Slip10Ed25519,
        addr_cls=XlmAddrEncoder,
        addr_params={"addr_type": XlmAddrTypes.PUB_KEY},
    )

    # Configuration for Polkadot (ed25519 SLIP-0010)
    PolkadotEd25519Slip: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.Polkadot.CoinNames(),
        coin_idx=Slip44.POLKADOT,
        is_testnet=False,
        def_path=DER_PATH_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=None,
        bip32_cls=Bip32Slip10Ed25519,
        addr_cls=SubstrateEd25519AddrEncoder,
        addr_params={
            "ss58_format": CoinsConf.Polkadot.ParamByKey("addr_ss58_format"),
        },
    )

    # Configuration for Polygon
    Polygon: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.Polygon.CoinNames(),
        coin_idx=Slip44.ETHEREUM,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=None,
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=EthAddrEncoder,
        addr_params={},
    )

    # Configuration for Ripple
    Ripple: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.Ripple.CoinNames(),
        coin_idx=Slip44.RIPPLE,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=None,
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=XrpAddrEncoder,
        addr_params={},
    )

    # Configuration for Secret Network (old path)
    SecretNetworkOld: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.SecretNetwork.CoinNames(),
        coin_idx=Slip44.ATOM,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=None,
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=AtomAddrEncoder,
        addr_params={
            "hrp": CoinsConf.SecretNetwork.ParamByKey("addr_hrp"),
        },
    )
    # Configuration for Secret Network (new path)
    SecretNetworkNew: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.SecretNetwork.CoinNames(),
        coin_idx=Slip44.SECRET_NETWORK,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=None,
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=AtomAddrEncoder,
        addr_params={
            "hrp": CoinsConf.SecretNetwork.ParamByKey("addr_hrp"),
        },
    )

    # Configuration for Solana
    Solana: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.Solana.CoinNames(),
        coin_idx=Slip44.SOLANA,
        is_testnet=False,
        def_path=DER_PATH_HARDENED_SHORT,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=None,
        bip32_cls=Bip32Slip10Ed25519,
        addr_cls=SolAddrEncoder,
        addr_params={},
    )

    # Configuration for Stafi
    Stafi: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.Stafi.CoinNames(),
        coin_idx=Slip44.ATOM,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=None,
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=AtomAddrEncoder,
        addr_params={
            "hrp": CoinsConf.Stafi.ParamByKey("addr_hrp"),
        },
    )

    # Configuration for Stellar
    Stellar: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.Stellar.CoinNames(),
        coin_idx=Slip44.STELLAR,
        is_testnet=False,
        def_path=DER_PATH_HARDENED_SHORT,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=None,
        bip32_cls=Bip32Slip10Ed25519,
        addr_cls=XlmAddrEncoder,
        addr_params={"addr_type": XlmAddrTypes.PUB_KEY},
    )

    # Configuration for Sui
    Sui: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.Sui.CoinNames(),
        coin_idx=Slip44.SUI,
        is_testnet=False,
        def_path=DER_PATH_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=None,
        bip32_cls=Bip32Slip10Ed25519,
        addr_cls=SuiAddrEncoder,
        addr_params={},
    )

    # Configuration for Terra
    Terra: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.Terra.CoinNames(),
        coin_idx=Slip44.TERRA,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=None,
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=AtomAddrEncoder,
        addr_params={
            "hrp": CoinsConf.Terra.ParamByKey("addr_hrp"),
        },
    )

    # Configuration for Tezos
    Tezos: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.Tezos.CoinNames(),
        coin_idx=Slip44.TEZOS,
        is_testnet=False,
        def_path=DER_PATH_HARDENED_MID,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=None,
        bip32_cls=Bip32Slip10Ed25519,
        addr_cls=XtzAddrEncoder,
        addr_params={"prefix": XtzAddrPrefixes.TZ1},
    )

    # Configuration for Theta
    Theta: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.Theta.CoinNames(),
        coin_idx=Slip44.THETA,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=None,
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=EthAddrEncoder,
        addr_params={},
    )

    # Configuration for Tron
    Tron: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.Tron.CoinNames(),
        coin_idx=Slip44.TRON,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=None,
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=TrxAddrEncoder,
        addr_params={},
    )

    # Configuration for VeChain
    VeChain: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.VeChain.CoinNames(),
        coin_idx=Slip44.VECHAIN,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=None,
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=EthAddrEncoder,
        addr_params={},
    )

    # Configuration for Verge
    Verge: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.Verge.CoinNames(),
        coin_idx=Slip44.VERGE,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=CoinsConf.Verge.ParamByKey("wif_net_ver"),
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=P2PKHAddrEncoder,
        addr_params={
            "net_ver": CoinsConf.Verge.ParamByKey("p2pkh_net_ver"),
        },
    )

    # Configuration for Zcash main net
    ZcashMainNet: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.ZcashMainNet.CoinNames(),
        coin_idx=Slip44.ZCASH,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=CoinsConf.ZcashMainNet.ParamByKey("wif_net_ver"),
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=P2PKHAddrEncoder,
        addr_params={
            "net_ver": CoinsConf.ZcashMainNet.ParamByKey("p2pkh_net_ver"),
        },
    )
    # Configuration for Zcash test net
    ZcashTestNet: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.ZcashTestNet.CoinNames(),
        coin_idx=Slip44.TESTNET,
        is_testnet=True,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_TEST,
        wif_net_ver=CoinsConf.ZcashTestNet.ParamByKey("wif_net_ver"),
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=P2PKHAddrEncoder,
        addr_params={
            "net_ver": CoinsConf.ZcashTestNet.ParamByKey("p2pkh_net_ver"),
        },
    )

    # Configuration for Zilliqa
    Zilliqa: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.Zilliqa.CoinNames(),
        coin_idx=Slip44.ZILLIQA,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP44_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=None,
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=ZilAddrEncoder,
        addr_params={},
    )


# For compatibility
Bip44Conf.Neo = Bip44Conf.NeoLegacy
