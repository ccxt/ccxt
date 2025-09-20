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

"""Module for Ergo address encoding/decoding."""

# Imports
from enum import IntEnum, unique
from typing import Any, Union

from bip_utils.addr.addr_dec_utils import AddrDecUtils
from bip_utils.addr.addr_key_validator import AddrKeyValidator
from bip_utils.addr.iaddr_decoder import IAddrDecoder
from bip_utils.addr.iaddr_encoder import IAddrEncoder
from bip_utils.base58 import Base58Decoder, Base58Encoder
from bip_utils.ecc import IPublicKey, Secp256k1PublicKey
from bip_utils.utils.crypto import Blake2b256
from bip_utils.utils.misc import IntegerUtils


@unique
class ErgoAddressTypes(IntEnum):
    """Enumerative for Ergo address types."""

    P2PKH = 0x01
    P2SH = 0x02


@unique
class ErgoNetworkTypes(IntEnum):
    """Enumerative for Ergo network types."""

    MAINNET = 0x00
    TESTNET = 0x10


class ErgoAddrConst:
    """Class container for Ergo address constants."""

    # Checksum length in bytes
    CHECKSUM_BYTE_LEN: int = 4


class _ErgoAddrUtils:
    """Ergo address utility class."""

    @staticmethod
    def ComputeChecksum(pub_key_bytes: bytes) -> bytes:
        """
        Compute checksum in Ergo format.

        Args:
            pub_key_bytes (bytes): Public key bytes

        Returns:
            bytes: Computed checksum
        """
        return Blake2b256.QuickDigest(pub_key_bytes)[:ErgoAddrConst.CHECKSUM_BYTE_LEN]

    @staticmethod
    def EncodePrefix(addr_type: ErgoAddressTypes,
                     net_type: ErgoNetworkTypes) -> bytes:
        """
        Encode prefix.

        Args:
            addr_type (ErgoAddressTypes): Address type
            net_type (ErgoNetworkTypes) : Network type

        Returns:
            bytes: Prefix byte
        """
        return IntegerUtils.ToBytes(addr_type + net_type)


class ErgoP2PKHAddrDecoder(IAddrDecoder):
    """
    Ergo P2PKH address decoder class.
    It allows the Ergo P2PKH address decoding.
    """

    @staticmethod
    def DecodeAddr(addr: str,
                   **kwargs: Any) -> bytes:
        """
        Decode an Ergo P2PKH address to bytes.

        Args:
            addr (str): Address string

        Other Parameters:
            net_type (ErgoNetworkTypes): Expected network type (default: main net)

        Returns:
            bytes: Public key bytes

        Raises:
            ValueError: If the address encoding is not valid
            TypeError: If the network tag is not a ErgoNetworkTypes enum
        """
        net_type = kwargs.get("net_type", ErgoNetworkTypes.MAINNET)
        if not isinstance(net_type, ErgoNetworkTypes):
            raise TypeError("Address type is not an enumerative of ErgoNetworkTypes")

        # Decode from base58
        addr_dec_bytes = Base58Decoder.Decode(addr)
        # Validate length
        AddrDecUtils.ValidateLength(addr_dec_bytes,
                                    Secp256k1PublicKey.CompressedLength() + ErgoAddrConst.CHECKSUM_BYTE_LEN + 1)

        # Get back checksum and public key bytes
        addr_with_prefix, checksum_bytes = AddrDecUtils.SplitPartsByChecksum(addr_dec_bytes,
                                                                             ErgoAddrConst.CHECKSUM_BYTE_LEN)
        # Validate checksum
        AddrDecUtils.ValidateChecksum(addr_with_prefix, checksum_bytes, _ErgoAddrUtils.ComputeChecksum)
        # Validate and remove prefix
        pub_key_bytes = AddrDecUtils.ValidateAndRemovePrefix(
            addr_with_prefix,
            _ErgoAddrUtils.EncodePrefix(ErgoAddressTypes.P2PKH, net_type)
        )
        # Validate public key
        AddrDecUtils.ValidatePubKey(pub_key_bytes, Secp256k1PublicKey)

        return pub_key_bytes


class ErgoP2PKHAddrEncoder(IAddrEncoder):
    """
    Ergo P2PKH address encoder class.
    It allows the Ergo P2PKH address encoding.
    """

    @staticmethod
    def EncodeKey(pub_key: Union[bytes, IPublicKey],
                  **kwargs: Any) -> str:
        """
        Encode a public key to Ergo P2PKH address.

        Args:
            pub_key (bytes or IPublicKey): Public key bytes or object

        Other Parameters:
            net_type (ErgoNetworkTypes): Network type (default: main net)

        Returns:
            str: Address string

        Raised:
            ValueError: If the public key is not valid
            TypeError: If the public key is not secp256k1 or the network tag is not a ErgoNetworkTypes enum
        """
        net_type = kwargs.get("net_type", ErgoNetworkTypes.MAINNET)
        if not isinstance(net_type, ErgoNetworkTypes):
            raise TypeError("Address type is not an enumerative of ErgoNetworkTypes")

        pub_key_obj = AddrKeyValidator.ValidateAndGetSecp256k1Key(pub_key)
        pub_key_bytes = pub_key_obj.RawCompressed().ToBytes()

        prefix_byte = _ErgoAddrUtils.EncodePrefix(ErgoAddressTypes.P2PKH, net_type)
        addr_payload_bytes = prefix_byte + pub_key_bytes

        return Base58Encoder.Encode(addr_payload_bytes + _ErgoAddrUtils.ComputeChecksum(addr_payload_bytes))


# Deprecated: only for compatibility, Encoder class shall be used instead
ErgoP2PKHAddr = ErgoP2PKHAddrEncoder
