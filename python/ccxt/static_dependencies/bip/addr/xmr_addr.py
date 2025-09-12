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

"""Module for Monero address encoding/decoding."""

# Imports
from typing import Any, Optional, Union

from bip_utils.addr.addr_dec_utils import AddrDecUtils
from bip_utils.addr.addr_key_validator import AddrKeyValidator
from bip_utils.addr.iaddr_decoder import IAddrDecoder
from bip_utils.addr.iaddr_encoder import IAddrEncoder
from bip_utils.base58 import Base58XmrDecoder, Base58XmrEncoder
from bip_utils.ecc import Ed25519MoneroPublicKey, IPublicKey
from bip_utils.utils.crypto import Kekkak256
from bip_utils.utils.misc import BytesUtils


class XmrAddrConst:
    """Class container for Monero address constants."""

    # Checksum length in bytes
    CHECKSUM_BYTE_LEN: int = 4
    # Payment ID length in bytes
    PAYMENT_ID_BYTE_LEN: int = 8


class _XmrAddrUtils:
    """Class container for Monero address utility functions."""

    @staticmethod
    def ComputeChecksum(payload_bytes: bytes) -> bytes:
        """
        Compute checksum in EOS format.

        Args:
            payload_bytes (bytes): Payload bytes

        Returns:
            bytes: Computed checksum
        """
        return Kekkak256.QuickDigest(payload_bytes)[:XmrAddrConst.CHECKSUM_BYTE_LEN]

    @staticmethod
    def DecodeAddr(addr: str,
                   net_ver_bytes: bytes,
                   payment_id_bytes: Optional[bytes] = None) -> bytes:
        """
        Decode a Monero address to bytes.

        Args:
            addr (str)                       : Address string
            net_ver_bytes (bytes)            : Net version
           payment_id_bytes (bytes, optional): Payment ID (only for integrated addresses)

        Returns:
            bytes: Public spend (first) and view (second) keys joined together

        Raises:
            ValueError: If the address encoding is not valid
        """

        # Decode from base58 XMR
        addr_dec_bytes = Base58XmrDecoder.Decode(addr)
        # Validate, remove prefix and split
        payload_bytes, checksum_bytes = AddrDecUtils.SplitPartsByChecksum(addr_dec_bytes,
                                                                          XmrAddrConst.CHECKSUM_BYTE_LEN)
        # Validate checksum
        AddrDecUtils.ValidateChecksum(payload_bytes, checksum_bytes, _XmrAddrUtils.ComputeChecksum)
        # Validate and remove prefix
        payload_bytes = AddrDecUtils.ValidateAndRemovePrefix(payload_bytes, net_ver_bytes)

        try:
            # Validate length without payment ID
            AddrDecUtils.ValidateLength(payload_bytes,
                                        Ed25519MoneroPublicKey.CompressedLength() * 2)
        except ValueError as ex:
            # Validate length with payment ID
            AddrDecUtils.ValidateLength(
                payload_bytes,
                (Ed25519MoneroPublicKey.CompressedLength() * 2) + XmrAddrConst.PAYMENT_ID_BYTE_LEN
            )
            # Check payment ID
            if payment_id_bytes is None or len(payment_id_bytes) != XmrAddrConst.PAYMENT_ID_BYTE_LEN:
                raise ValueError("Invalid payment ID") from ex

            payment_id_got_bytes = payload_bytes[-XmrAddrConst.PAYMENT_ID_BYTE_LEN:]
            if payment_id_bytes != payment_id_got_bytes:
                raise ValueError(f"Invalid payment ID (expected {BytesUtils.ToHexString(payment_id_bytes)}, "
                                 f"got {BytesUtils.ToHexString(payment_id_got_bytes)})") from ex

        # Validate public spend key
        pub_spend_key_bytes = payload_bytes[:Ed25519MoneroPublicKey.CompressedLength()]
        AddrDecUtils.ValidatePubKey(pub_spend_key_bytes, Ed25519MoneroPublicKey)
        # Validate public view key
        pub_view_key_bytes = payload_bytes[Ed25519MoneroPublicKey.CompressedLength():
                                           Ed25519MoneroPublicKey.CompressedLength() * 2]
        AddrDecUtils.ValidatePubKey(pub_view_key_bytes, Ed25519MoneroPublicKey)

        return pub_spend_key_bytes + pub_view_key_bytes

    @staticmethod
    def EncodeKey(pub_skey: Union[bytes, IPublicKey],
                  pub_vkey: Union[bytes, IPublicKey],
                  net_ver_bytes: bytes,
                  payment_id_bytes: Optional[bytes] = None) -> str:
        """
        Encode a public key to Monero address.

        Args:
            pub_skey (bytes or IPublicKey)    : Public spend key bytes or object
            pub_vkey (bytes or IPublicKey)    : Public view key bytes or object
            net_ver_bytes (bytes)             : Net version
            payment_id_bytes (bytes, optional): Payment ID (only for integrated addresses)

        Returns:
            str: Address string

        Raises:
            ValueError: If the public key is not valid
            TypeError: If the public key is not ed25519-monero
        """
        if payment_id_bytes is not None and len(payment_id_bytes) != XmrAddrConst.PAYMENT_ID_BYTE_LEN:
            raise ValueError("Invalid payment ID length")

        payment_id_bytes = b"" if payment_id_bytes is None else payment_id_bytes
        pub_spend_key_obj = AddrKeyValidator.ValidateAndGetEd25519MoneroKey(pub_skey)
        pub_view_key_obj = AddrKeyValidator.ValidateAndGetEd25519MoneroKey(pub_vkey)

        payload_bytes = (net_ver_bytes
                         + pub_spend_key_obj.RawCompressed().ToBytes()
                         + pub_view_key_obj.RawCompressed().ToBytes()
                         + payment_id_bytes)

        return Base58XmrEncoder.Encode(payload_bytes + _XmrAddrUtils.ComputeChecksum(payload_bytes))


class XmrAddrDecoder(IAddrDecoder):
    """
    Monero address decoder class.
    It allows the Monero address decoding.
    """

    @staticmethod
    def DecodeAddr(addr: str,
                   **kwargs: Any) -> bytes:
        """
        Decode a Monero address to bytes.

        Args:
            addr (str): Address string

        Other Parameters:
            net_ver (bytes): Expected net version

        Returns:
            bytes: Public spend (first) and view (second) keys joined together

        Raises:
            ValueError: If the address encoding is not valid
        """
        net_ver = kwargs["net_ver"]
        return _XmrAddrUtils.DecodeAddr(addr, net_ver)


class XmrAddrEncoder(IAddrEncoder):
    """
    Monero address encoder class.
    It allows the Monero address encoding.
    """

    @staticmethod
    def EncodeKey(pub_key: Union[bytes, IPublicKey],
                  **kwargs: Any) -> str:
        """
        Encode a public key to Monero format.

        Args:
            pub_key (bytes or IPublicKey): Public spend key bytes or object

        Other Parameters:
            pub_vkey (bytes or IPublicKey): Public view key bytes or object
            net_ver (bytes)               : Net version
            payment_id (bytes, optional)  : Payment ID (only for integrated addresses)

        Returns:
            str: Address string

        Raises:
            ValueError: If the public key is not valid
            TypeError: If the public key is not ed25519-monero
        """
        pub_vkey = kwargs["pub_vkey"]
        net_ver = kwargs["net_ver"]

        return _XmrAddrUtils.EncodeKey(pub_key, pub_vkey, net_ver)


class XmrIntegratedAddrDecoder(IAddrDecoder):
    """
    Monero integrated address decoder class.
    It allows the Monero integrated address decoding.
    """

    @staticmethod
    def DecodeAddr(addr: str,
                   **kwargs: Any) -> bytes:
        """
        Decode a Monero address to bytes.

        Args:
            addr (str): Address string

        Other Parameters:
            net_ver (bytes)   : Expected net version
            payment_id (bytes): Expected payment ID

        Returns:
            bytes: Public spend (first) and view (second) keys joined together

        Raises:
            ValueError: If the address encoding is not valid
        """
        net_ver = kwargs["net_ver"]
        payment_id = kwargs["payment_id"]
        return _XmrAddrUtils.DecodeAddr(addr, net_ver, payment_id)


class XmrIntegratedAddrEncoder(IAddrEncoder):
    """
    Monero integrated address encoder class.
    It allows the Monero integrated address encoding.
    """

    @staticmethod
    def EncodeKey(pub_key: Union[bytes, IPublicKey],
                  **kwargs: Any) -> str:
        """
        Encode a public key to Monero integrated address.

        Args:
            pub_key (bytes or IPublicKey): Public spend key bytes or object

        Other Parameters:
            pub_vkey (bytes or IPublicKey): Public view key bytes or object
            net_ver (bytes)               : Net version
            payment_id (bytes)            : Payment ID

        Returns:
            str: Address string

        Raises:
            ValueError: If the public key is not valid
            TypeError: If the public key is not ed25519-monero
        """
        pub_vkey = kwargs["pub_vkey"]
        net_ver = kwargs["net_ver"]
        payment_id = kwargs["payment_id"]

        return _XmrAddrUtils.EncodeKey(pub_key, pub_vkey, net_ver, payment_id)


# Deprecated: only for compatibility, Encoder classes shall be used instead
XmrAddr = XmrAddrEncoder
XmrIntegratedAddr = XmrIntegratedAddrEncoder
