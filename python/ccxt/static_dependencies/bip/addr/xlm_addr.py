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

"""Module for Stellar address encoding/decoding."""

# Imports
from enum import IntEnum, unique
from typing import Any, Union

from bip_utils.addr.addr_dec_utils import AddrDecUtils
from bip_utils.addr.addr_key_validator import AddrKeyValidator
from bip_utils.addr.iaddr_decoder import IAddrDecoder
from bip_utils.addr.iaddr_encoder import IAddrEncoder
from bip_utils.ecc import Ed25519PublicKey, IPublicKey
from bip_utils.utils.crypto import XModemCrc
from bip_utils.utils.misc import Base32Decoder, Base32Encoder, BytesUtils, IntegerUtils


@unique
class XlmAddrTypes(IntEnum):
    """Enumerative for Stellar address types."""

    PUB_KEY = 6 << 3
    PRIV_KEY = 18 << 3


class XlmAddrConst:
    """Class container for Stellar address constants."""

    # Checksum length in bytes
    CHECKSUM_BYTE_LEN: int = 2


class _XlmAddrUtils:
    """Stellar address utility class."""

    @staticmethod
    def ComputeChecksum(payload_bytes: bytes) -> bytes:
        """
        Compute checksum in Stellar format.

        Args:
            payload_bytes (bytes): Payload bytes

        Returns:
            bytes: Computed checksum
        """
        return BytesUtils.Reverse(XModemCrc.QuickDigest(payload_bytes))


class XlmAddrDecoder(IAddrDecoder):
    """
    Stellar address decoder class.
    It allows the Stellar address decoding.
    """

    @staticmethod
    def DecodeAddr(addr: str,
                   **kwargs: Any) -> bytes:
        """
        Decode a Stellar address to bytes.

        Args:
            addr (str): Address string

        Other Parameters:
            addr_type (XlmAddrTypes): Expected address type (default: public key)

        Returns:
            bytes: Public key bytes

        Raises:
            ValueError: If the address encoding is not valid
            TypeError: If the address type is not a XlmAddrTypes enum
        """

        # Get and check address type
        addr_type = kwargs.get("addr_type", XlmAddrTypes.PUB_KEY)
        if not isinstance(addr_type, XlmAddrTypes):
            raise TypeError("Address type is not an enumerative of XlmAddrTypes")

        # Decode from base32
        addr_dec_bytes = Base32Decoder.Decode(addr)
        # Validate length
        AddrDecUtils.ValidateLength(addr_dec_bytes,
                                    Ed25519PublicKey.CompressedLength() + XlmAddrConst.CHECKSUM_BYTE_LEN)
        # Get back checksum and payload bytes
        payload_bytes, checksum_bytes = AddrDecUtils.SplitPartsByChecksum(addr_dec_bytes,
                                                                          XlmAddrConst.CHECKSUM_BYTE_LEN)
        # Check address type
        addr_type_got = payload_bytes[0]
        if addr_type != addr_type_got:
            raise ValueError(f"Invalid address type (expected {addr_type.value}, "
                             f"got {addr_type_got})")

        # Validate checksum
        AddrDecUtils.ValidateChecksum(payload_bytes, checksum_bytes, _XlmAddrUtils.ComputeChecksum)
        # Validate public key
        pub_key_bytes = payload_bytes[1:]
        AddrDecUtils.ValidatePubKey(pub_key_bytes, Ed25519PublicKey)

        return pub_key_bytes


class XlmAddrEncoder(IAddrEncoder):
    """
    Stellar address encoder class.
    It allows the Stellar address encoding.
    """

    @staticmethod
    def EncodeKey(pub_key: Union[bytes, IPublicKey],
                  **kwargs: Any) -> str:
        """
        Encode a public key to Stellar address.

        Args:
            pub_key (bytes or IPublicKey): Public key bytes or object

        Other Parameters:
            addr_type (XlmAddrTypes): Address type (default: public key)

        Returns:
            str: Address string

        Raises:
            ValueError: If the public key is not valid
            TypeError: If the public key is not ed25519 or address type is not a XlmAddrTypes enum
        """

        # Get and check address type
        addr_type = kwargs.get("addr_type", XlmAddrTypes.PUB_KEY)
        if not isinstance(addr_type, XlmAddrTypes):
            raise TypeError("Address type is not an enumerative of XlmAddrTypes")

        # Get public key
        pub_key_obj = AddrKeyValidator.ValidateAndGetEd25519Key(pub_key)
        payload_bytes = IntegerUtils.ToBytes(addr_type) + pub_key_obj.RawCompressed().ToBytes()[1:]

        # Compute checksum
        checksum_bytes = _XlmAddrUtils.ComputeChecksum(payload_bytes)
        # Encode to base32
        return Base32Encoder.EncodeNoPadding(payload_bytes + checksum_bytes)


# Deprecated: only for compatibility, Encoder class shall be used instead
XlmAddr = XlmAddrEncoder
