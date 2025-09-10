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

"""Module for P2SH address encoding/decoding."""

# Imports
from typing import Any, Union

from bip_utils.addr.addr_key_validator import AddrKeyValidator
from bip_utils.addr.iaddr_decoder import IAddrDecoder
from bip_utils.addr.iaddr_encoder import IAddrEncoder
from bip_utils.addr.P2PKH_addr import BchP2PKHAddrDecoder, P2PKHAddrDecoder
from bip_utils.base58 import Base58Encoder
from bip_utils.bech32 import BchBech32Encoder
from bip_utils.ecc import IPublicKey
from bip_utils.utils.crypto import Hash160


class P2SHAddrConst:
    """Class container for P2SH constants."""

    # Script bytes
    SCRIPT_BYTES: bytes = b"\x00\x14"


class _P2SHAddrUtils:
    """Class container for P2SH utility functions."""

    @staticmethod
    def AddScriptSig(pub_key: IPublicKey) -> bytes:
        """
        Add script signature to public key and get address bytes.

        Args:
            pub_key (IPublicKey object): Public key object

        Returns:
            bytes: Address bytes
        """

        # Key hash: Hash160(public_key)
        key_hash_bytes = Hash160.QuickDigest(pub_key.RawCompressed().ToBytes())
        # Script signature: 0x0014 | Hash160(public_key)
        script_sig_bytes = P2SHAddrConst.SCRIPT_BYTES + key_hash_bytes
        # Address bytes = Hash160(script_signature)
        return Hash160.QuickDigest(script_sig_bytes)


class P2SHAddrDecoder(IAddrDecoder):
    """
    P2SH address decoder class.
    It allows the Pay-to-Script-Hash address decoding.
    """

    @staticmethod
    def DecodeAddr(addr: str,
                   **kwargs: Any) -> bytes:
        """
        Decode a P2SH address to bytes.

        Args:
            addr (str): Address string

        Other Parameters:
            net_ver (bytes): Expected net address version

        Returns:
            bytes: Script signature hash bytes

        Raises:
            ValueError: If the address encoding is not valid
        """

        # The decoding steps are the same of P2PKH
        return P2PKHAddrDecoder.DecodeAddr(addr, net_ver=kwargs["net_ver"])


class P2SHAddrEncoder(IAddrEncoder):
    """
    P2SH address encoder class.
    It allows the Pay-to-Script-Hash address encoding.
    """

    @staticmethod
    def EncodeKey(pub_key: Union[bytes, IPublicKey],
                  **kwargs: Any) -> str:
        """
        Encode a public key to P2SH address.

        Args:
            pub_key (bytes or IPublicKey) : Public key bytes or object

        Other Parameters:
            net_ver (bytes): Net address version

        Returns:
            str: Address string

        Raises:
            ValueError: If the public key is not valid
            TypeError: If the public key is not secp256k1
        """
        net_ver_bytes = kwargs["net_ver"]

        pub_key_obj = AddrKeyValidator.ValidateAndGetSecp256k1Key(pub_key)
        return Base58Encoder.CheckEncode(net_ver_bytes + _P2SHAddrUtils.AddScriptSig(pub_key_obj))


class BchP2SHAddrDecoder(IAddrDecoder):
    """
    Bitcoin Cash P2SH address decoder class.
    It allows the Bitcoin Cash P2SH decoding.
    """

    @staticmethod
    def DecodeAddr(addr: str,
                   **kwargs: Any) -> bytes:
        """
        Decode a Bitcoin Cash P2SH address to bytes.

        Args:
            addr (str): Address string

        Other Parameters:
            hrp (str)      : Expected HRP
            net_ver (bytes): Expected net address version

        Returns:
            bytes: Script signature hash bytes

        Raises:
            ValueError: If the address encoding is not valid
        """

        # The decoding steps are the same of P2PKH
        return BchP2PKHAddrDecoder.DecodeAddr(addr, hrp=kwargs["hrp"], net_ver=kwargs["net_ver"])


class BchP2SHAddrEncoder(IAddrEncoder):
    """
    Bitcoin Cash P2SH address encoder class.
    It allows the Bitcoin Cash P2SH encoding.
    """

    @staticmethod
    def EncodeKey(pub_key: Union[bytes, IPublicKey],
                  **kwargs: Any) -> str:
        """
        Encode a public key to Bitcoin Cash P2SH address.

        Args:
            pub_key (bytes or IPublicKey): Public key bytes or object

        Other Parameters:
            hrp (str)      : HRP
            net_ver (bytes): Net address version

        Returns:
            str: Address string

        Raises:
            ValueError: If the public key is not valid
            TypeError: If the public key is not secp256k1
        """
        hrp = kwargs["hrp"]
        net_ver_bytes = kwargs["net_ver"]

        pub_key_obj = AddrKeyValidator.ValidateAndGetSecp256k1Key(pub_key)
        return BchBech32Encoder.Encode(hrp, net_ver_bytes, _P2SHAddrUtils.AddScriptSig(pub_key_obj))


# Deprecated: only for compatibility, Encoder classes shall be used instead
P2SHAddr = P2SHAddrEncoder
BchP2SHAddr = BchP2SHAddrEncoder
