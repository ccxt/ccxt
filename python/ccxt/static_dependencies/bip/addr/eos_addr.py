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

"""Module for EOS address encoding/decoding."""

# Imports
from typing import Any, Union

from bip_utils.addr.addr_dec_utils import AddrDecUtils
from bip_utils.addr.addr_key_validator import AddrKeyValidator
from bip_utils.addr.iaddr_decoder import IAddrDecoder
from bip_utils.addr.iaddr_encoder import IAddrEncoder
from bip_utils.base58 import Base58Decoder, Base58Encoder
from bip_utils.coin_conf import CoinsConf
from bip_utils.ecc import IPublicKey, Secp256k1PublicKey
from bip_utils.utils.crypto import Ripemd160


class EosAddrConst:
    """Class container for EOS address constants."""

    # Checksum length in bytes
    CHECKSUM_BYTE_LEN: int = 4


class _EosAddrUtils:
    """EOS address utility class."""

    @staticmethod
    def ComputeChecksum(pub_key_bytes: bytes) -> bytes:
        """
        Compute checksum in EOS format.

        Args:
            pub_key_bytes (bytes): Public key bytes

        Returns:
            bytes: Computed checksum
        """
        return Ripemd160.QuickDigest(pub_key_bytes)[:EosAddrConst.CHECKSUM_BYTE_LEN]


class EosAddrDecoder(IAddrDecoder):
    """
    EOS address decoder class.
    It allows the EOS address decoding.
    """

    @staticmethod
    def DecodeAddr(addr: str,
                   **kwargs: Any) -> bytes:
        """
        Decode an EOS address to bytes.

        Args:
            addr (str): Address string
            **kwargs  : Not used

        Returns:
            bytes: Public key bytes

        Raises:
            ValueError: If the address encoding is not valid
        """

        # Validate and remove prefix
        addr_no_prefix = AddrDecUtils.ValidateAndRemovePrefix(addr,
                                                              CoinsConf.Eos.ParamByKey("addr_prefix"))
        # Decode from base58
        addr_dec_bytes = Base58Decoder.Decode(addr_no_prefix)
        # Validate length
        AddrDecUtils.ValidateLength(addr_dec_bytes,
                                    Secp256k1PublicKey.CompressedLength() + EosAddrConst.CHECKSUM_BYTE_LEN)

        # Get back checksum and public key bytes
        pub_key_bytes, checksum_bytes = AddrDecUtils.SplitPartsByChecksum(addr_dec_bytes,
                                                                          EosAddrConst.CHECKSUM_BYTE_LEN)
        # Validate checksum
        AddrDecUtils.ValidateChecksum(pub_key_bytes, checksum_bytes, _EosAddrUtils.ComputeChecksum)
        # Validate public key
        AddrDecUtils.ValidatePubKey(pub_key_bytes, Secp256k1PublicKey)

        return pub_key_bytes


class EosAddrEncoder(IAddrEncoder):
    """
    EOS address encoder class.
    It allows the EOS address encoding.
    """

    @staticmethod
    def EncodeKey(pub_key: Union[bytes, IPublicKey],
                  **kwargs: Any) -> str:
        """
        Encode a public key to EOS address.

        Args:
            pub_key (bytes or IPublicKey): Public key bytes or object
            **kwargs                     : Not used

        Returns:
            str: Address string

        Raised:
            ValueError: If the public key is not valid
            TypeError: If the public key is not secp256k1
        """
        pub_key_obj = AddrKeyValidator.ValidateAndGetSecp256k1Key(pub_key)
        pub_key_bytes = pub_key_obj.RawCompressed().ToBytes()

        checksum_bytes = _EosAddrUtils.ComputeChecksum(pub_key_bytes)

        return CoinsConf.Eos.ParamByKey("addr_prefix") + Base58Encoder.Encode(pub_key_bytes + checksum_bytes)


# Deprecated: only for compatibility, Encoder class shall be used instead
EosAddr = EosAddrEncoder
