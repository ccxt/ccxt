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

"""Module for Filecoin address encoding/decoding."""

# Imports
from enum import IntEnum, unique
from typing import Any, Union

from bip_utils.addr.addr_dec_utils import AddrDecUtils
from bip_utils.addr.addr_key_validator import AddrKeyValidator
from bip_utils.addr.iaddr_decoder import IAddrDecoder
from bip_utils.addr.iaddr_encoder import IAddrEncoder
from bip_utils.coin_conf import CoinsConf
from bip_utils.ecc import IPublicKey
from bip_utils.utils.crypto import Blake2b32, Blake2b160
from bip_utils.utils.misc import Base32Decoder, Base32Encoder, IntegerUtils


@unique
class FillAddrTypes(IntEnum):
    """Enumerative for Filecoin address types."""

    SECP256K1 = 1
    BLS = 3


class FilAddrConst:
    """Class container for Filecoin address constants."""

    # Alphabet for base32
    BASE32_ALPHABET: str = "abcdefghijklmnopqrstuvwxyz234567"


class _FilAddrUtils:
    """Class container for Filecoin address utility functions."""

    @staticmethod
    def ComputeChecksum(pub_key_hash: bytes,
                        addr_type: FillAddrTypes) -> bytes:
        """
        Compute checksum in EOS format.

        Args:
            pub_key_hash (bytes)     : Public key hash
            addr_type (FillAddrTypes): Address type

        Returns:
            bytes: Computed checksum
        """
        addr_type_byte = IntegerUtils.ToBytes(addr_type)
        return Blake2b32.QuickDigest(addr_type_byte + pub_key_hash)

    @staticmethod
    def DecodeAddr(addr: str,
                   addr_type: FillAddrTypes) -> bytes:
        """
        Decode a Filecoin address to bytes.

        Args:
            addr (str)               : Address string
            addr_type (FillAddrTypes): Address type

        Returns:
            bytes: Public key hash bytes

        Raises:
            ValueError: If the address encoding is not valid
        """

        # Validate and remove prefix
        addr_no_prefix = AddrDecUtils.ValidateAndRemovePrefix(addr, CoinsConf.Filecoin.ParamByKey("addr_prefix"))
        # Check address type
        addr_type_got = ord(addr_no_prefix[0]) - ord("0")
        if addr_type != addr_type_got:
            raise ValueError(f"Invalid address type (expected {addr_type}, got {addr_type_got})")
        # Decode from base32
        addr_dec_bytes = Base32Decoder.Decode(addr_no_prefix[1:], FilAddrConst.BASE32_ALPHABET)
        # Validate length
        AddrDecUtils.ValidateLength(addr_dec_bytes,
                                    Blake2b160.DigestSize() + Blake2b32.DigestSize())

        # Get back checksum and public key bytes
        pub_key_hash_bytes, checksum_bytes = AddrDecUtils.SplitPartsByChecksum(addr_dec_bytes,
                                                                               Blake2b32.DigestSize())
        # Validate checksum
        AddrDecUtils.ValidateChecksum(pub_key_hash_bytes, checksum_bytes,
                                      lambda pub_key_bytes: _FilAddrUtils.ComputeChecksum(pub_key_bytes, addr_type))

        return pub_key_hash_bytes

    @staticmethod
    def EncodeKeyBytes(pub_key_bytes: bytes,
                       addr_type: FillAddrTypes) -> str:
        """
        Encode a public key to Filecoin address.

        Args:
            pub_key_bytes (bytes)    : Public key bytes
            addr_type (FillAddrTypes): Address type

        Returns:
            str: Address string
        """

        # Get address type
        addr_type_str = chr(addr_type + ord("0"))

        # Compute public key hash and checksum
        pub_key_hash_bytes = Blake2b160.QuickDigest(pub_key_bytes)
        checksum_bytes = _FilAddrUtils.ComputeChecksum(pub_key_hash_bytes, addr_type)
        # Encode to base32
        b32_enc = Base32Encoder.EncodeNoPadding(pub_key_hash_bytes + checksum_bytes, FilAddrConst.BASE32_ALPHABET)

        return CoinsConf.Filecoin.ParamByKey("addr_prefix") + addr_type_str + b32_enc


class FilSecp256k1AddrDecoder(IAddrDecoder):
    """
    Filecoin address decoder class, based on secp256k1 curve.
    It allows the Filecoin address decoding.
    """

    @staticmethod
    def DecodeAddr(addr: str,
                   **kwargs: Any) -> bytes:
        """
        Decode a Filecoin address to bytes.

        Args:
            addr (str): Address string
            **kwargs  : Not used

        Returns:
            bytes: Public key hash bytes

        Raises:
            ValueError: If the address encoding is not valid
        """
        return _FilAddrUtils.DecodeAddr(addr, FillAddrTypes.SECP256K1)


class FilSecp256k1AddrEncoder(IAddrEncoder):
    """
    Filecoin address encoder class, based on secp256k1 curve.
    It allows the Filecoin address encoding.
    """

    @staticmethod
    def EncodeKey(pub_key: Union[bytes, IPublicKey],
                  **kwargs: Any) -> str:
        """
        Encode a public key to Filecoin address.

        Args:
            pub_key (bytes or IPublicKey): Public key bytes or object
            **kwargs                     : Not used

        Returns:
            str: Address string

        Raised:
            ValueError: If the public key is not valid
            TypeError: If the public key is not secp256k1 or the address type is not valid
        """
        pub_key_obj = AddrKeyValidator.ValidateAndGetSecp256k1Key(pub_key)
        pub_key_bytes = pub_key_obj.RawUncompressed().ToBytes()

        return _FilAddrUtils.EncodeKeyBytes(pub_key_bytes, FillAddrTypes.SECP256K1)


# Deprecated: only for compatibility, Encoder class shall be used instead
FilSecp256k1Addr = FilSecp256k1AddrEncoder
