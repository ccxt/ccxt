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
Module for Cardano Shelley address encoding/decoding.
Reference: https://cips.cardano.org/cips/cip19
"""

# Imports
from enum import IntEnum, unique
from typing import Any, Dict, Union

from bip_utils.addr.addr_dec_utils import AddrDecUtils
from bip_utils.addr.addr_key_validator import AddrKeyValidator
from bip_utils.addr.iaddr_decoder import IAddrDecoder
from bip_utils.addr.iaddr_encoder import IAddrEncoder
from bip_utils.bech32 import Bech32ChecksumError, Bech32Decoder, Bech32Encoder
from bip_utils.coin_conf import CoinsConf
from bip_utils.ecc import IPublicKey
from bip_utils.utils.crypto import Blake2b224
from bip_utils.utils.misc import IntegerUtils


@unique
class AdaShelleyAddrNetworkTags(IntEnum):
    """Enumerative for Cardano Shelley network tags."""

    TESTNET = 0
    MAINNET = 1


@unique
class AdaShelleyAddrHeaderTypes(IntEnum):
    """Enumerative for Cardano Shelley header types."""

    PAYMENT = 0x00
    REWARD = 0x0E


class AdaShelleyAddrConst:
    """Class container for Cardano Shelley address constants."""

    # Network tag to address HRP
    NETWORK_TAG_TO_ADDR_HRP: Dict[AdaShelleyAddrNetworkTags, str] = {
        AdaShelleyAddrNetworkTags.MAINNET: CoinsConf.CardanoMainNet.ParamByKey("addr_hrp"),
        AdaShelleyAddrNetworkTags.TESTNET: CoinsConf.CardanoTestNet.ParamByKey("addr_hrp"),
    }
    # Network tag to staking address HRP
    NETWORK_TAG_TO_REWARD_ADDR_HRP: Dict[AdaShelleyAddrNetworkTags, str] = {
        AdaShelleyAddrNetworkTags.MAINNET: CoinsConf.CardanoMainNet.ParamByKey("staking_addr_hrp"),
        AdaShelleyAddrNetworkTags.TESTNET: CoinsConf.CardanoTestNet.ParamByKey("staking_addr_hrp"),
    }


class _AdaShelleyAddrUtils:
    """Cardano Shelley address utility class."""

    @staticmethod
    def KeyHash(pub_key_bytes: bytes) -> bytes:
        """
        Compute the key hash.

        Args:
            pub_key_bytes (bytes): Public key bytes

        Returns:
            bytes: Key hash bytes
        """
        return Blake2b224.QuickDigest(pub_key_bytes)

    @staticmethod
    def EncodePrefix(hdr_type: AdaShelleyAddrHeaderTypes,
                     net_tag: AdaShelleyAddrNetworkTags) -> bytes:
        """
        Encode address prefix.

        Args:
            hdr_type (AdaShelleyAddrHeaderTypes): Header type
            net_tag (AdaShelleyAddrNetworkTags) : Network tag

        Returns:
            bytes: Prefix byte
        """
        return IntegerUtils.ToBytes((hdr_type << 4) + net_tag)


class AdaShelleyAddrDecoder(IAddrDecoder):
    """
    Cardano Shelley address decoder class.
    It allows the Cardano Shelley address decoding.
    """

    @staticmethod
    def DecodeAddr(addr: str,
                   **kwargs: Any) -> bytes:
        """
        Decode a Cardano Shelley address to bytes.

        Args:
            addr (str): Address string
            **kwargs  : Not used

        Other Parameters:
            net_tag (AdaShelleyAddrNetworkTags): Expected network tag (default: main net)

        Returns:
            bytes: Public keys hash bytes (public key + public staking key)

        Raises:
            ValueError: If the address encoding is not valid
            TypeError: If the network tag is not a AdaShelleyAddrNetworkTags enum
        """
        net_tag = kwargs.get("net_tag", AdaShelleyAddrNetworkTags.MAINNET)
        if not isinstance(net_tag, AdaShelleyAddrNetworkTags):
            raise TypeError("Address type is not an enumerative of AdaShelleyAddrNetworkTags")

        # Decode bech32
        try:
            addr_dec_bytes = Bech32Decoder.Decode(AdaShelleyAddrConst.NETWORK_TAG_TO_ADDR_HRP[net_tag],
                                                  addr)
        except Bech32ChecksumError as ex:
            raise ValueError("Invalid bech32 checksum") from ex

        AddrDecUtils.ValidateLength(addr_dec_bytes,
                                    (Blake2b224.DigestSize() * 2) + 1)
        # Validate and remove prefix
        prefix_byte = _AdaShelleyAddrUtils.EncodePrefix(AdaShelleyAddrHeaderTypes.PAYMENT,
                                                        net_tag)
        return AddrDecUtils.ValidateAndRemovePrefix(addr_dec_bytes, prefix_byte)


class AdaShelleyAddrEncoder(IAddrEncoder):
    """
    Cardano Shelley address encoder class.
    It allows the Cardano Shelley address encoding.
    """

    @staticmethod
    def EncodeKey(pub_key: Union[bytes, IPublicKey],
                  **kwargs: Any) -> str:
        """
        Encode a public key to Cardano Shelley address.

        Args:
            pub_key (bytes or IPublicKey): Public key bytes or object

        Other Parameters:
            pub_skey (bytes or IPublicKey)     : Public staking key bytes or object
            net_tag (AdaShelleyAddrNetworkTags): Network tag (default: main net)

        Returns:
            str: Address string

        Raises:
            ValueError: If the public key is not valid
            TypeError: If the public key is not ed25519 or the network tag is not a AdaShelleyAddrNetworkTags enum
        """
        pub_skey = kwargs["pub_skey"]
        net_tag = kwargs.get("net_tag", AdaShelleyAddrNetworkTags.MAINNET)
        if not isinstance(net_tag, AdaShelleyAddrNetworkTags):
            raise TypeError("Address type is not an enumerative of AdaShelleyAddrNetworkTags")

        pub_key_obj = AddrKeyValidator.ValidateAndGetEd25519Key(pub_key)
        pub_skey_obj = AddrKeyValidator.ValidateAndGetEd25519Key(pub_skey)

        # Compute keys hash
        pub_key_hash = _AdaShelleyAddrUtils.KeyHash(pub_key_obj.RawCompressed().ToBytes()[1:])
        pub_skey_hash = _AdaShelleyAddrUtils.KeyHash(pub_skey_obj.RawCompressed().ToBytes()[1:])
        # Get prefix byte
        prefix_byte = _AdaShelleyAddrUtils.EncodePrefix(AdaShelleyAddrHeaderTypes.PAYMENT,
                                                        net_tag)

        # Encode to bech32
        return Bech32Encoder.Encode(AdaShelleyAddrConst.NETWORK_TAG_TO_ADDR_HRP[net_tag],
                                    prefix_byte + pub_key_hash + pub_skey_hash)


class AdaShelleyStakingAddrDecoder(IAddrDecoder):
    """
    Cardano Shelley staking address decoder class.
    It allows the Cardano Shelley staking address decoding.
    """

    @staticmethod
    def DecodeAddr(addr: str,
                   **kwargs: Any) -> bytes:
        """
        Decode a Cardano Shelley address to bytes.

        Args:
            addr (str): Address string
            **kwargs  : Not used

        Other Parameters:
            net_tag (AdaShelleyAddrNetworkTags): Network tag (default: main net)

        Returns:
            bytes: Public keys hash bytes (public key + public staking key)

        Raises:
            ValueError: If the address encoding is not valid
            TypeError: If the network tag is not a AdaShelleyAddrNetworkTags enum
        """
        net_tag = kwargs.get("net_tag", AdaShelleyAddrNetworkTags.MAINNET)
        if not isinstance(net_tag, AdaShelleyAddrNetworkTags):
            raise TypeError("Address type is not an enumerative of AdaShelleyAddrNetworkTags")

        # Decode bech32
        try:
            addr_dec_bytes = Bech32Decoder.Decode(AdaShelleyAddrConst.NETWORK_TAG_TO_REWARD_ADDR_HRP[net_tag],
                                                  addr)
        except Bech32ChecksumError as ex:
            raise ValueError("Invalid bech32 checksum") from ex

        AddrDecUtils.ValidateLength(addr_dec_bytes,
                                    Blake2b224.DigestSize() + 1)
        # Validate and remove prefix
        prefix_byte = _AdaShelleyAddrUtils.EncodePrefix(AdaShelleyAddrHeaderTypes.REWARD,
                                                        net_tag)
        return AddrDecUtils.ValidateAndRemovePrefix(addr_dec_bytes, prefix_byte)


class AdaShelleyStakingAddrEncoder(IAddrEncoder):
    """
    Cardano Shelley staking address encoder class.
    It allows the Cardano Shelley staking address encoding.
    """

    @staticmethod
    def EncodeKey(pub_key: Union[bytes, IPublicKey],
                  **kwargs: Any) -> str:
        """
        Encode a public key to Cardano Shelley staking address.

        Args:
            pub_key (bytes or IPublicKey): Public key bytes or object

        Other Parameters:
            net_tag (AdaShelleyAddrNetworkTags): Network tag (default: main net)

        Returns:
            str: Address string

        Raises:
            ValueError: If the public key is not valid
            TypeError: If the public key is not ed25519 or the network tag is not a AdaShelleyAddrNetworkTags enum
        """
        net_tag = kwargs.get("net_tag", AdaShelleyAddrNetworkTags.MAINNET)
        if not isinstance(net_tag, AdaShelleyAddrNetworkTags):
            raise TypeError("Address type is not an enumerative of AdaShelleyAddrNetworkTags")

        pub_key_obj = AddrKeyValidator.ValidateAndGetEd25519Key(pub_key)

        # Compute keys hash
        pub_key_hash = _AdaShelleyAddrUtils.KeyHash(pub_key_obj.RawCompressed().ToBytes()[1:])
        # Get first byte
        first_byte = _AdaShelleyAddrUtils.EncodePrefix(AdaShelleyAddrHeaderTypes.REWARD,
                                                       net_tag)

        # Encode to bech32
        return Bech32Encoder.Encode(AdaShelleyAddrConst.NETWORK_TAG_TO_REWARD_ADDR_HRP[net_tag],
                                    first_byte + pub_key_hash)


# Deprecated: only for compatibility, Encoder classes shall be used instead
AdaShelleyAddr = AdaShelleyAddrEncoder
AdaShelleyStakingAddr = AdaShelleyStakingAddrEncoder

# Alternative names for staking address
AdaShelleyRewardAddrDecoder = AdaShelleyStakingAddrDecoder
AdaShelleyRewardAddrEncoder = AdaShelleyStakingAddrEncoder
AdaShelleyRewardAddr = AdaShelleyStakingAddr
