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

"""Module for BIP49 coins configuration."""

# Imports
from bip_utils.addr import BchP2SHAddrEncoder, P2SHAddrEncoder
from bip_utils.bip.bip32 import Bip32KeyNetVersions, Bip32Slip10Secp256k1
from  import DER_PATH_NON_HARDENED_FULL, BipBitcoinCashConf, BipCoinConf, BipLitecoinConf
from bip_utils.coin_conf import CoinsConf
from bip_utils.slip.slip44 import Slip44


# Bitcoin key net version for main net (ypub / yprv)
_BIP49_BTC_KEY_NET_VER_MAIN: Bip32KeyNetVersions = Bip32KeyNetVersions(b"\x04\x9d\x7c\xb2",
                                                                       b"\x04\x9d\x78\x78")
# Bitcoin key net version for test net (upub / uprv)
_BIP49_BTC_KEY_NET_VER_TEST: Bip32KeyNetVersions = Bip32KeyNetVersions(b"\x04\x4a\x52\x62",
                                                                       b"\x04\x4a\x4e\x28")


class Bip49Conf:
    """Class container for BIP49 configuration."""

    # Configuration for Bitcoin main net
    BitcoinMainNet: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.BitcoinMainNet.CoinNames(),
        coin_idx=Slip44.BITCOIN,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP49_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=CoinsConf.BitcoinMainNet.ParamByKey("wif_net_ver"),
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=P2SHAddrEncoder,
        addr_params={
            "net_ver": CoinsConf.BitcoinMainNet.ParamByKey("p2sh_net_ver"),
        },
    )
    # Configuration for Bitcoin regtest
    BitcoinRegTest: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.BitcoinRegTest.CoinNames(),
        coin_idx=Slip44.TESTNET,
        is_testnet=True,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP49_BTC_KEY_NET_VER_TEST,
        wif_net_ver=CoinsConf.BitcoinRegTest.ParamByKey("wif_net_ver"),
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=P2SHAddrEncoder,
        addr_params={
            "net_ver": CoinsConf.BitcoinRegTest.ParamByKey("p2sh_net_ver"),
        },
    )
    # Configuration for Bitcoin test net
    BitcoinTestNet: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.BitcoinTestNet.CoinNames(),
        coin_idx=Slip44.TESTNET,
        is_testnet=True,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP49_BTC_KEY_NET_VER_TEST,
        wif_net_ver=CoinsConf.BitcoinTestNet.ParamByKey("wif_net_ver"),
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=P2SHAddrEncoder,
        addr_params={
            "net_ver": CoinsConf.BitcoinTestNet.ParamByKey("p2sh_net_ver"),
        },
    )

    # Configuration for Bitcoin Cash main net
    BitcoinCashMainNet: BipBitcoinCashConf = BipBitcoinCashConf(
        coin_names=CoinsConf.BitcoinCashMainNet.CoinNames(),
        coin_idx=Slip44.BITCOIN_CASH,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP49_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=CoinsConf.BitcoinCashMainNet.ParamByKey("wif_net_ver"),
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=BchP2SHAddrEncoder,
        addr_params={
            "std": {
                "net_ver": CoinsConf.BitcoinCashMainNet.ParamByKey("p2sh_std_net_ver"),
                "hrp": CoinsConf.BitcoinCashMainNet.ParamByKey("p2sh_std_hrp"),
            },
            "legacy": {
                "net_ver": CoinsConf.BitcoinCashMainNet.ParamByKey("p2sh_legacy_net_ver"),
            }
        },
        addr_cls_legacy=P2SHAddrEncoder,
    )
    # Configuration for Bitcoin Cash test net
    BitcoinCashTestNet: BipBitcoinCashConf = BipBitcoinCashConf(
        coin_names=CoinsConf.BitcoinCashTestNet.CoinNames(),
        coin_idx=Slip44.TESTNET,
        is_testnet=True,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP49_BTC_KEY_NET_VER_TEST,
        wif_net_ver=CoinsConf.BitcoinCashTestNet.ParamByKey("wif_net_ver"),
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=BchP2SHAddrEncoder,
        addr_params={
            "std": {
                "net_ver": CoinsConf.BitcoinCashTestNet.ParamByKey("p2sh_std_net_ver"),
                "hrp": CoinsConf.BitcoinCashTestNet.ParamByKey("p2sh_std_hrp"),
            },
            "legacy": {
                "net_ver": CoinsConf.BitcoinCashTestNet.ParamByKey("p2sh_legacy_net_ver"),
            }
        },
        addr_cls_legacy=P2SHAddrEncoder,
    )

    # Configuration for Bitcoin Cash Simple Ledger Protocol main net
    BitcoinCashSlpMainNet: BipBitcoinCashConf = BipBitcoinCashConf(
        coin_names=CoinsConf.BitcoinCashSlpMainNet.CoinNames(),
        coin_idx=Slip44.BITCOIN_CASH,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP49_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=CoinsConf.BitcoinCashSlpMainNet.ParamByKey("wif_net_ver"),
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=BchP2SHAddrEncoder,
        addr_params={
            "std": {
                "net_ver": CoinsConf.BitcoinCashSlpMainNet.ParamByKey("p2sh_std_net_ver"),
                "hrp": CoinsConf.BitcoinCashSlpMainNet.ParamByKey("p2sh_std_hrp"),
            },
            "legacy": {
                "net_ver": CoinsConf.BitcoinCashSlpMainNet.ParamByKey("p2sh_legacy_net_ver"),
            }
        },
        addr_cls_legacy=P2SHAddrEncoder,
    )
    # Configuration for Bitcoin Cash Simple Ledger Protocol test net
    BitcoinCashSlpTestNet: BipBitcoinCashConf = BipBitcoinCashConf(
        coin_names=CoinsConf.BitcoinCashSlpTestNet.CoinNames(),
        coin_idx=Slip44.TESTNET,
        is_testnet=True,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP49_BTC_KEY_NET_VER_TEST,
        wif_net_ver=CoinsConf.BitcoinCashSlpTestNet.ParamByKey("wif_net_ver"),
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=BchP2SHAddrEncoder,
        addr_params={
            "std": {
                "net_ver": CoinsConf.BitcoinCashSlpTestNet.ParamByKey("p2sh_std_net_ver"),
                "hrp": CoinsConf.BitcoinCashSlpTestNet.ParamByKey("p2sh_std_hrp"),
            },
            "legacy": {
                "net_ver": CoinsConf.BitcoinCashSlpTestNet.ParamByKey("p2sh_legacy_net_ver"),
            }
        },
        addr_cls_legacy=P2SHAddrEncoder,
    )

    # Configuration for BitcoinSV main net
    BitcoinSvMainNet: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.BitcoinSvMainNet.CoinNames(),
        coin_idx=Slip44.BITCOIN_SV,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP49_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=CoinsConf.BitcoinSvMainNet.ParamByKey("wif_net_ver"),
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=P2SHAddrEncoder,
        addr_params={
            "net_ver": CoinsConf.BitcoinSvMainNet.ParamByKey("p2sh_net_ver"),
        },
    )
    # Configuration for BitcoinSV test net
    BitcoinSvTestNet: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.BitcoinSvTestNet.CoinNames(),
        coin_idx=Slip44.TESTNET,
        is_testnet=True,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP49_BTC_KEY_NET_VER_TEST,
        wif_net_ver=CoinsConf.BitcoinSvTestNet.ParamByKey("wif_net_ver"),
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=P2SHAddrEncoder,
        addr_params={
            "net_ver": CoinsConf.BitcoinSvTestNet.ParamByKey("p2sh_net_ver"),
        },
    )

    # Configuration for Dash main net
    DashMainNet: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.DashMainNet.CoinNames(),
        coin_idx=Slip44.DASH,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP49_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=CoinsConf.DashMainNet.ParamByKey("wif_net_ver"),
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=P2SHAddrEncoder,
        addr_params={
            "net_ver": CoinsConf.DashMainNet.ParamByKey("p2sh_net_ver"),
        },
    )
    # Configuration for Dash test net
    DashTestNet: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.DashTestNet.CoinNames(),
        coin_idx=Slip44.TESTNET,
        is_testnet=True,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP49_BTC_KEY_NET_VER_TEST,
        wif_net_ver=CoinsConf.DashTestNet.ParamByKey("wif_net_ver"),
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=P2SHAddrEncoder,
        addr_params={
            "net_ver": CoinsConf.DashTestNet.ParamByKey("p2sh_net_ver"),
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
        addr_cls=P2SHAddrEncoder,
        addr_params={
            "net_ver": CoinsConf.DogecoinMainNet.ParamByKey("p2sh_net_ver"),
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
        addr_cls=P2SHAddrEncoder,
        addr_params={
            "net_ver": CoinsConf.DogecoinTestNet.ParamByKey("p2sh_net_ver"),
        },
    )

    # Configuration for eCash main net
    EcashMainNet: BipBitcoinCashConf = BipBitcoinCashConf(
        coin_names=CoinsConf.EcashMainNet.CoinNames(),
        coin_idx=Slip44.BITCOIN_CASH,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP49_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=CoinsConf.EcashMainNet.ParamByKey("wif_net_ver"),
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=BchP2SHAddrEncoder,
        addr_params={
            "std": {
                "net_ver": CoinsConf.EcashMainNet.ParamByKey("p2sh_std_net_ver"),
                "hrp": CoinsConf.EcashMainNet.ParamByKey("p2sh_std_hrp"),
            },
            "legacy": {
                "net_ver": CoinsConf.EcashMainNet.ParamByKey("p2sh_legacy_net_ver"),
            }
        },
        addr_cls_legacy=P2SHAddrEncoder,
    )
    # Configuration for eCash test net
    EcashTestNet: BipBitcoinCashConf = BipBitcoinCashConf(
        coin_names=CoinsConf.EcashTestNet.CoinNames(),
        coin_idx=Slip44.TESTNET,
        is_testnet=True,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP49_BTC_KEY_NET_VER_TEST,
        wif_net_ver=CoinsConf.EcashTestNet.ParamByKey("wif_net_ver"),
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=BchP2SHAddrEncoder,
        addr_params={
            "std": {
                "net_ver": CoinsConf.EcashTestNet.ParamByKey("p2sh_std_net_ver"),
                "hrp": CoinsConf.EcashTestNet.ParamByKey("p2sh_std_hrp"),
            },
            "legacy": {
                "net_ver": CoinsConf.EcashTestNet.ParamByKey("p2sh_legacy_net_ver"),
            }
        },
        addr_cls_legacy=P2SHAddrEncoder,
    )

    # Configuration for Litecoin main net
    LitecoinMainNet: BipLitecoinConf = BipLitecoinConf(
        coin_names=CoinsConf.LitecoinMainNet.CoinNames(),
        coin_idx=Slip44.LITECOIN,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP49_BTC_KEY_NET_VER_MAIN,
        alt_key_net_ver=Bip32KeyNetVersions(b"\x01\xb2\x6e\xf6",
                                            b"\x01\xb2\x67\x92"),   # Mtpv / Mtub
        wif_net_ver=CoinsConf.LitecoinMainNet.ParamByKey("wif_net_ver"),
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=P2SHAddrEncoder,
        addr_params={
            "std_net_ver": CoinsConf.LitecoinMainNet.ParamByKey("p2sh_std_net_ver"),
            "depr_net_ver": CoinsConf.LitecoinMainNet.ParamByKey("p2sh_depr_net_ver"),
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
        addr_cls=P2SHAddrEncoder,
        addr_params={
            "std_net_ver": CoinsConf.LitecoinTestNet.ParamByKey("p2sh_std_net_ver"),
            "depr_net_ver": CoinsConf.LitecoinTestNet.ParamByKey("p2sh_depr_net_ver"),
        },
    )

    # Configuration for Zcash main net
    ZcashMainNet: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.ZcashMainNet.CoinNames(),
        coin_idx=Slip44.ZCASH,
        is_testnet=False,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP49_BTC_KEY_NET_VER_MAIN,
        wif_net_ver=CoinsConf.ZcashMainNet.ParamByKey("wif_net_ver"),
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=P2SHAddrEncoder,
        addr_params={
            "net_ver": CoinsConf.ZcashMainNet.ParamByKey("p2sh_net_ver"),
        },
    )
    # Configuration for Zcash test net
    ZcashTestNet: BipCoinConf = BipCoinConf(
        coin_names=CoinsConf.ZcashTestNet.CoinNames(),
        coin_idx=Slip44.TESTNET,
        is_testnet=True,
        def_path=DER_PATH_NON_HARDENED_FULL,
        key_net_ver=_BIP49_BTC_KEY_NET_VER_TEST,
        wif_net_ver=CoinsConf.ZcashTestNet.ParamByKey("wif_net_ver"),
        bip32_cls=Bip32Slip10Secp256k1,
        addr_cls=P2SHAddrEncoder,
        addr_params={
            "net_ver": CoinsConf.ZcashTestNet.ParamByKey("p2sh_net_ver"),
        },
    )
