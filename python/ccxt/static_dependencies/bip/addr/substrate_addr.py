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

"""Module for Substrate address encoding/decoding."""

# Imports
from typing import Any, Type, Union

from bip_utils.addr.addr_dec_utils import AddrDecUtils
from bip_utils.addr.addr_key_validator import AddrKeyValidator
from bip_utils.addr.iaddr_decoder import IAddrDecoder
from bip_utils.addr.iaddr_encoder import IAddrEncoder
from bip_utils.ecc import Ed25519PublicKey, IPublicKey, Sr25519PublicKey
from bip_utils.ss58 import SS58ChecksumError, SS58Decoder, SS58Encoder


class _SubstrateAddrUtils:
    """Substrate address utility class."""

    @staticmethod
    def DecodeAddr(addr: str,
                   ss58_format: int,
                   pub_key_cls: Type[IPublicKey]) -> bytes:
        """
        Decode a Substrate address to bytes.

        Args:
            addr (str)              : Address string
            ss58_format (int)       : SS58 format
            pub_key_cls (IPublicKey): Public key class type

        Returns:
            bytes: Public key bytes

        Raises:
            ValueError: If the address encoding is not valid
        """

        try:
            # Decode from SS58 (SS58Decoder.Decode also validates the length)
            ss58_format_got, addr_dec_bytes = SS58Decoder.Decode(addr)
        except SS58ChecksumError as ex:
            raise ValueError("Invalid SS58 encoding") from ex
        # Check SS58 format
        if ss58_format != ss58_format_got:
            raise ValueError(f"Invalid SS58 format (expected {ss58_format}, got {ss58_format_got})")
        # Validate public key
        AddrDecUtils.ValidatePubKey(addr_dec_bytes, pub_key_cls)

        return addr_dec_bytes


class SubstrateEd25519AddrDecoder(IAddrDecoder):
    """
    Substrate address decoder class, based on ed25519 curve.
    It allows the Substrate address decoding.
    """

    @staticmethod
    def DecodeAddr(addr: str,
                   **kwargs: Any) -> bytes:
        """
        Decode a Substrate address to bytes.

        Args:
            addr (str): Address string

        Other Parameters:
            ss58_format (int): Expected SS58 format

        Returns:
            bytes: Public key bytes

        Raises:
            ValueError: If the address encoding is not valid
        """
        return _SubstrateAddrUtils.DecodeAddr(addr, kwargs["ss58_format"], Ed25519PublicKey)


class SubstrateEd25519AddrEncoder(IAddrEncoder):
    """
    Substrate address encoder class, based on ed25519 curve.
    It allows the Substrate address encoding.
    """

    @staticmethod
    def EncodeKey(pub_key: Union[bytes, IPublicKey],
                  **kwargs: Any) -> str:
        """
        Encode a public key to Substrate address.

        Args:
            pub_key (bytes or IPublicKey): Public key bytes or object

        Other Parameters:
            ss58_format (int): SS58 format

        Returns:
            str: Address string

        Raised:
            ValueError: If the public key is not valid
        """
        ss58_format = kwargs["ss58_format"]

        pub_key_obj = AddrKeyValidator.ValidateAndGetEd25519Key(pub_key)
        return SS58Encoder.Encode(pub_key_obj.RawCompressed().ToBytes()[1:], ss58_format)


class SubstrateSr25519AddrDecoder(IAddrDecoder):
    """
    Substrate address decoder class, based on sr25519 curve.
    It allows the Substrate address decoding.
    """

    @staticmethod
    def DecodeAddr(addr: str,
                   **kwargs: Any) -> bytes:
        """
        Decode a Substrate address to bytes.

        Args:
            addr (str): Address string

        Other Parameters:
            ss58_format (int): Expected SS58 format

        Returns:
            bytes: Public key bytes

        Raises:
            ValueError: If the address encoding is not valid
        """
        return _SubstrateAddrUtils.DecodeAddr(addr, kwargs["ss58_format"], Sr25519PublicKey)


class SubstrateSr25519AddrEncoder(IAddrEncoder):
    """
    Substrate address encoder class, based on sr25519 curve.
    It allows the Substrate address encoding.
    """

    @staticmethod
    def EncodeKey(pub_key: Union[bytes, IPublicKey],
                  **kwargs: Any) -> str:
        """
        Encode a public key to Substrate address.

        Args:
            pub_key (bytes or IPublicKey): Public key bytes or object

        Other Parameters:
            ss58_format (int): SS58 format

        Returns:
            str: Address string

        Raised:
            ValueError: If the public key is not valid
        """
        ss58_format = kwargs["ss58_format"]

        pub_key_obj = AddrKeyValidator.ValidateAndGetSr25519Key(pub_key)
        return SS58Encoder.Encode(pub_key_obj.RawCompressed().ToBytes(), ss58_format)


# Deprecated: only for compatibility, Encoder classes shall be used instead
SubstrateEd25519Addr = SubstrateEd25519AddrEncoder
SubstrateSr25519Addr = SubstrateSr25519AddrEncoder
