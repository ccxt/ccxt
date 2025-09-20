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

"""Module for Nano address encoding/decoding."""

# Imports
from typing import Any, Union

from bip_utils.addr.addr_dec_utils import AddrDecUtils
from bip_utils.addr.addr_key_validator import AddrKeyValidator
from bip_utils.addr.iaddr_decoder import IAddrDecoder
from bip_utils.addr.iaddr_encoder import IAddrEncoder
from bip_utils.coin_conf import CoinsConf
from bip_utils.ecc import Ed25519Blake2bPublicKey, IPublicKey
from bip_utils.utils.crypto import Blake2b40
from bip_utils.utils.misc import Base32Decoder, Base32Encoder, BytesUtils


class NanoAddrConst:
    """Class container for Nano address constants."""

    # Alphabet for base32
    BASE32_ALPHABET: str = "13456789abcdefghijkmnopqrstuwxyz"
    # Payload padding (decoded)
    PAYLOAD_PAD_DEC: bytes = b"\x00\x00\x00"
    # Payload padding (encoded)
    PAYLOAD_PAD_ENC: str = "1111"


class _NanoAddrUtils:
    """Nano address utility class."""

    @staticmethod
    def ComputeChecksum(pub_key_bytes: bytes) -> bytes:
        """
        Compute checksum in Nano format.

        Args:
            pub_key_bytes (bytes): Public key bytes

        Returns:
            bytes: Computed checksum
        """
        return BytesUtils.Reverse(Blake2b40.QuickDigest(pub_key_bytes))


class NanoAddrDecoder(IAddrDecoder):
    """
    Nano address decoder class.
    It allows the Nano address decoding.
    """

    @staticmethod
    def DecodeAddr(addr: str,
                   **kwargs: Any) -> bytes:
        """
        Decode a Nano address to bytes.

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
                                                              CoinsConf.Nano.ParamByKey("addr_prefix"))
        # Decode from base32
        addr_dec_bytes = Base32Decoder.Decode(NanoAddrConst.PAYLOAD_PAD_ENC + addr_no_prefix,
                                              NanoAddrConst.BASE32_ALPHABET)
        # Validate length
        AddrDecUtils.ValidateLength(addr_dec_bytes,
                                    Ed25519Blake2bPublicKey.CompressedLength() + Blake2b40.DigestSize()
                                    + len(NanoAddrConst.PAYLOAD_PAD_DEC) - 1)

        # Get back checksum and public key bytes
        pub_key_bytes, checksum_bytes = AddrDecUtils.SplitPartsByChecksum(
            addr_dec_bytes[len(NanoAddrConst.PAYLOAD_PAD_DEC):],
            Blake2b40.DigestSize()
        )
        # Validate checksum
        AddrDecUtils.ValidateChecksum(pub_key_bytes, checksum_bytes, _NanoAddrUtils.ComputeChecksum)
        # Validate public key
        AddrDecUtils.ValidatePubKey(pub_key_bytes, Ed25519Blake2bPublicKey)

        return pub_key_bytes


class NanoAddrEncoder(IAddrEncoder):
    """
    Nano address encoder class.
    It allows the Nano address encoding.
    """

    @staticmethod
    def EncodeKey(pub_key: Union[bytes, IPublicKey],
                  **kwargs: Any) -> str:
        """
        Encode a public key to Nano address.

        Args:
            pub_key (bytes or IPublicKey): Public key bytes or object
            **kwargs: Not used

        Returns:
            str: Address string

        Raises:
            ValueError: If the public key is not valid
            TypeError: If the public key is not ed25519-blake2b
        """
        pub_key_obj = AddrKeyValidator.ValidateAndGetEd25519Blake2bKey(pub_key)
        pub_key_bytes = pub_key_obj.RawCompressed().ToBytes()[1:]

        # Compute checksum
        checksum_bytes = _NanoAddrUtils.ComputeChecksum(pub_key_bytes)
        # Encode to base32
        payload_bytes = NanoAddrConst.PAYLOAD_PAD_DEC + pub_key_bytes + checksum_bytes
        b32_enc = Base32Encoder.EncodeNoPadding(payload_bytes, NanoAddrConst.BASE32_ALPHABET)

        # Add prefix
        return CoinsConf.Nano.ParamByKey("addr_prefix") + b32_enc[len(NanoAddrConst.PAYLOAD_PAD_ENC):]


# Deprecated: only for compatibility, Encoder class shall be used instead
NanoAddr = NanoAddrEncoder
