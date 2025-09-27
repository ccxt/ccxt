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

"""Module for getting BIP44 coins configuration."""

# Imports
from typing import Dict

from bip_utils.bip.conf.bip44.bip44_coins import Bip44Coins
from bip_utils.bip.conf.bip44.bip44_conf import Bip44Conf
from  import BipCoinConf, BipCoins


class Bip44ConfGetterConst:
    """Class container for BIP44 configuration getter constants."""

    # Map from Bip44Coins to configuration classes
    COIN_TO_CONF: Dict[BipCoins, BipCoinConf] = {
        Bip44Coins.AKASH_NETWORK: Bip44Conf.AkashNetwork,
        Bip44Coins.ALGORAND: Bip44Conf.Algorand,
        Bip44Coins.APTOS: Bip44Conf.Aptos,
        Bip44Coins.ARBITRUM: Bip44Conf.Arbitrum,
        Bip44Coins.AVAX_C_CHAIN: Bip44Conf.AvaxCChain,
        Bip44Coins.AVAX_P_CHAIN: Bip44Conf.AvaxPChain,
        Bip44Coins.AVAX_X_CHAIN: Bip44Conf.AvaxXChain,
        Bip44Coins.AXELAR: Bip44Conf.Axelar,
        Bip44Coins.BAND_PROTOCOL: Bip44Conf.BandProtocol,
        Bip44Coins.BINANCE_CHAIN: Bip44Conf.BinanceChain,
        Bip44Coins.BINANCE_SMART_CHAIN: Bip44Conf.BinanceSmartChain,
        Bip44Coins.BITCOIN: Bip44Conf.BitcoinMainNet,
        Bip44Coins.BITCOIN_REGTEST: Bip44Conf.BitcoinRegTest,
        Bip44Coins.BITCOIN_TESTNET: Bip44Conf.BitcoinTestNet,
        Bip44Coins.BITCOIN_CASH: Bip44Conf.BitcoinCashMainNet,
        Bip44Coins.BITCOIN_CASH_TESTNET: Bip44Conf.BitcoinCashTestNet,
        Bip44Coins.BITCOIN_CASH_SLP: Bip44Conf.BitcoinCashSlpMainNet,
        Bip44Coins.BITCOIN_CASH_SLP_TESTNET: Bip44Conf.BitcoinCashSlpTestNet,
        Bip44Coins.BITCOIN_SV: Bip44Conf.BitcoinSvMainNet,
        Bip44Coins.BITCOIN_SV_TESTNET: Bip44Conf.BitcoinSvTestNet,
        Bip44Coins.CARDANO_BYRON_ICARUS: Bip44Conf.CardanoByronIcarus,
        Bip44Coins.CARDANO_BYRON_LEDGER: Bip44Conf.CardanoByronLedger,
        Bip44Coins.CELESTIA: Bip44Conf.Celestia,
        Bip44Coins.CELO: Bip44Conf.Celo,
        Bip44Coins.CERTIK: Bip44Conf.Certik,
        Bip44Coins.CHIHUAHUA: Bip44Conf.Chihuahua,
        Bip44Coins.COSMOS: Bip44Conf.Cosmos,
        Bip44Coins.DASH: Bip44Conf.DashMainNet,
        Bip44Coins.DASH_TESTNET: Bip44Conf.DashTestNet,
        Bip44Coins.DOGECOIN: Bip44Conf.DogecoinMainNet,
        Bip44Coins.DOGECOIN_TESTNET: Bip44Conf.DogecoinTestNet,
        Bip44Coins.DYDX: Bip44Conf.DYDX,
        Bip44Coins.ECASH: Bip44Conf.EcashMainNet,
        Bip44Coins.ECASH_TESTNET: Bip44Conf.EcashTestNet,
        Bip44Coins.ELROND: Bip44Conf.Elrond,
        Bip44Coins.EOS: Bip44Conf.Eos,
        Bip44Coins.ERGO: Bip44Conf.ErgoMainNet,
        Bip44Coins.ERGO_TESTNET: Bip44Conf.ErgoTestNet,
        Bip44Coins.ETHEREUM: Bip44Conf.Ethereum,
        Bip44Coins.ETHEREUM_CLASSIC: Bip44Conf.EthereumClassic,
        Bip44Coins.FANTOM_OPERA: Bip44Conf.FantomOpera,
        Bip44Coins.FETCH_AI: Bip44Conf.FetchAi,
        Bip44Coins.FETCH_AI_ETH: Bip44Conf.FetchAiEth,
        Bip44Coins.FILECOIN: Bip44Conf.Filecoin,
        Bip44Coins.HARMONY_ONE_ATOM: Bip44Conf.HarmonyOneAtom,
        Bip44Coins.HARMONY_ONE_ETH: Bip44Conf.HarmonyOneEth,
        Bip44Coins.HARMONY_ONE_METAMASK: Bip44Conf.HarmonyOneMetamask,
        Bip44Coins.HUOBI_CHAIN: Bip44Conf.HuobiChain,
        Bip44Coins.ICON: Bip44Conf.Icon,
        Bip44Coins.INJECTIVE: Bip44Conf.Injective,
        Bip44Coins.IRIS_NET: Bip44Conf.IrisNet,
        Bip44Coins.KAVA: Bip44Conf.Kava,
        Bip44Coins.KUSAMA_ED25519_SLIP: Bip44Conf.KusamaEd25519Slip,
        Bip44Coins.LITECOIN: Bip44Conf.LitecoinMainNet,
        Bip44Coins.LITECOIN_TESTNET: Bip44Conf.LitecoinTestNet,
        Bip44Coins.METIS: Bip44Conf.Metis,
        Bip44Coins.MONERO_ED25519_SLIP: Bip44Conf.MoneroEd25519Slip,
        Bip44Coins.MONERO_SECP256K1: Bip44Conf.MoneroSecp256k1,
        Bip44Coins.MULTIVERSX: Bip44Conf.Elrond,
        Bip44Coins.NANO: Bip44Conf.Nano,
        Bip44Coins.NEAR_PROTOCOL: Bip44Conf.NearProtocol,
        Bip44Coins.NEO: Bip44Conf.NeoLegacy,
        Bip44Coins.NEO_LEGACY: Bip44Conf.NeoLegacy,
        Bip44Coins.NEO_N3: Bip44Conf.NeoN3,
        Bip44Coins.NEUTRON: Bip44Conf.Neutron,
        Bip44Coins.NIMIQ: Bip44Conf.Nimiq,
        Bip44Coins.NINE_CHRONICLES_GOLD: Bip44Conf.NineChroniclesGold,
        Bip44Coins.OKEX_CHAIN_ATOM: Bip44Conf.OkexChainAtom,
        Bip44Coins.OKEX_CHAIN_ATOM_OLD: Bip44Conf.OkexChainAtomOld,
        Bip44Coins.OKEX_CHAIN_ETH: Bip44Conf.OkexChainEth,
        Bip44Coins.ONTOLOGY: Bip44Conf.Ontology,
        Bip44Coins.OPTIMISM: Bip44Conf.Optimism,
        Bip44Coins.OSMOSIS: Bip44Conf.Osmosis,
        Bip44Coins.PI_NETWORK: Bip44Conf.PiNetwork,
        Bip44Coins.POLKADOT_ED25519_SLIP: Bip44Conf.PolkadotEd25519Slip,
        Bip44Coins.POLYGON: Bip44Conf.Polygon,
        Bip44Coins.RIPPLE: Bip44Conf.Ripple,
        Bip44Coins.SECRET_NETWORK_OLD: Bip44Conf.SecretNetworkOld,
        Bip44Coins.SECRET_NETWORK_NEW: Bip44Conf.SecretNetworkNew,
        Bip44Coins.SOLANA: Bip44Conf.Solana,
        Bip44Coins.STAFI: Bip44Conf.Stafi,
        Bip44Coins.STELLAR: Bip44Conf.Stellar,
        Bip44Coins.SUI: Bip44Conf.Sui,
        Bip44Coins.TERRA: Bip44Conf.Terra,
        Bip44Coins.TEZOS: Bip44Conf.Tezos,
        Bip44Coins.THETA: Bip44Conf.Theta,
        Bip44Coins.TRON: Bip44Conf.Tron,
        Bip44Coins.VECHAIN: Bip44Conf.VeChain,
        Bip44Coins.VERGE: Bip44Conf.Verge,
        Bip44Coins.ZCASH: Bip44Conf.ZcashMainNet,
        Bip44Coins.ZCASH_TESTNET: Bip44Conf.ZcashTestNet,
        Bip44Coins.ZILLIQA: Bip44Conf.Zilliqa,
    }


class Bip44ConfGetter:
    """
    BIP44 configuration getter class.
    It allows to get the BIP44 configuration of a specific coin.
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
            TypeError: If coin type is not of a Bip44Coins enumerative
        """
        if not isinstance(coin_type, Bip44Coins):
            raise TypeError("Coin type is not an enumerative of Bip44Coins")
        return Bip44ConfGetterConst.COIN_TO_CONF[coin_type]
