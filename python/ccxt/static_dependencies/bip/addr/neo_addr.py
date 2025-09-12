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

"""Module for Neo address encoding/decoding."""

# Imports
from typing import Any, Union

from bip_utils.addr.addr_dec_utils import AddrDecUtils
from bip_utils.addr.addr_key_validator import AddrKeyValidator
from bip_utils.addr.iaddr_decoder import IAddrDecoder
from bip_utils.addr.iaddr_encoder import IAddrEncoder
from bip_utils.base58 import Base58ChecksumError, Base58Decoder, Base58Encoder
from bip_utils.ecc import IPublicKey
from bip_utils.utils.crypto import Hash160
from bip_utils.utils.misc import BytesUtils, IntegerUtils


class NeoAddrConst:
    """Class container for NEO address constants."""

    # Address prefix byte
    PREFIX_BYTE: bytes = b"\x21"
    # Address suffix byte
    SUFFIX_BYTE: bytes = b"\xac"


class NeoAddrDecoder(IAddrDecoder):
    """
    Neo address decoder class.
    It allows the Neo address decoding.
    """

    @staticmethod
    def DecodeAddr(addr: str,
                   **kwargs: Any) -> bytes:
        """
        Decode a Neo address to bytes.

        Args:
            addr (str): Address string

        Other Parameters:
            ver (bytes): Expected version

        Returns:
            bytes: Public key hash bytes

        Raises:
            ValueError: If the address encoding is not valid
        """
        ver_bytes = kwargs["ver"]

        try:
            # Decode from base58
            addr_dec_bytes = Base58Decoder.CheckDecode(addr)
        except Base58ChecksumError as ex:
            raise ValueError("Invalid base58 checksum") from ex

        # Validate length
        AddrDecUtils.ValidateLength(addr_dec_bytes,
                                    Hash160.DigestSize() + len(ver_bytes))
        # Check version
        ver_got = IntegerUtils.ToBytes(addr_dec_bytes[0])
        if ver_bytes != ver_got:
            raise ValueError(f"Invalid version (expected {BytesUtils.ToHexString(ver_bytes)}, "
                             f"got {BytesUtils.ToHexString(ver_got)})")

        return addr_dec_bytes[1:]


class NeoAddrEncoder(IAddrEncoder):
    """
    Neo address encoder class.
    It allows the Neo address encoding.
    """

    @staticmethod
    def EncodeKey(pub_key: Union[bytes, IPublicKey],
                  **kwargs: Any) -> str:
        """
        Encode a public key to Neo address.

        Args:
            pub_key (bytes or IPublicKey): Public key bytes or object

        Other Parameters:
            ver (bytes): Version

        Returns:
            str: Address string

        Raises:
            ValueError: If the public key is not valid
            TypeError: If the public key is not nist256p1
        """
        ver_bytes = kwargs["ver"]

        pub_key_obj = AddrKeyValidator.ValidateAndGetNist256p1Key(pub_key)

        # Get payload
        payload_bytes = (NeoAddrConst.PREFIX_BYTE
                         + pub_key_obj.RawCompressed().ToBytes()
                         + NeoAddrConst.SUFFIX_BYTE)
        # Encode to base58
        return Base58Encoder.CheckEncode(ver_bytes + Hash160.QuickDigest(payload_bytes))


# Deprecated: only for compatibility, Encoder class shall be used instead
NeoAddr = NeoAddrEncoder
