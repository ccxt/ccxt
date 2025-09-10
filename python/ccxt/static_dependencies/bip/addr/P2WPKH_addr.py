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

"""
Module for P2WPKH address encoding/decoding.

References:
    https://github.com/bitcoin/bips/blob/master/bip-0141.mediawiki
    https://github.com/bitcoin/bips/blob/master/bip-0173.mediawiki
"""

# Imports
from typing import Any, Union

from bip_utils.addr.addr_key_validator import AddrKeyValidator
from bip_utils.addr.iaddr_decoder import IAddrDecoder
from bip_utils.addr.iaddr_encoder import IAddrEncoder
from bip_utils.bech32 import Bech32ChecksumError, SegwitBech32Decoder, SegwitBech32Encoder
from bip_utils.ecc import IPublicKey
from bip_utils.utils.crypto import Hash160


class P2WPKHAddrConst:
    """Class container for P2WPKH constants."""

    # Witness version is fixed to zero for P2WPKH
    WITNESS_VER: int = 0


class P2WPKHAddrDecoder(IAddrDecoder):
    """
    P2WPKH address decoder class.
    It allows the Pay-to-Witness-Public-Key-Hash address decoding.
    """

    @staticmethod
    def DecodeAddr(addr: str,
                   **kwargs: Any) -> bytes:
        """
        Decode a P2WPKH address to bytes.

        Args:
            addr (str): Address string

        Other Parameters:
            hrp (str): Expected HRP

        Returns:
            bytes: Public key hash bytes

        Raises:
            ValueError: If the address encoding is not valid
        """
        hrp = kwargs["hrp"]

        try:
            # SegwitBech32Decoder also validates the length
            wit_ver_got, addr_dec_bytes = SegwitBech32Decoder.Decode(hrp, addr)
        except Bech32ChecksumError as ex:
            raise ValueError("Invalid bech32 checksum") from ex

        # Check witness version
        if wit_ver_got != P2WPKHAddrConst.WITNESS_VER:
            raise ValueError(f"Invalid witness version (expected {P2WPKHAddrConst.WITNESS_VER}, "
                             f"got {wit_ver_got})")
        return addr_dec_bytes


class P2WPKHAddrEncoder(IAddrEncoder):
    """
    P2WPKH address encoder class.
    It allows the Pay-to-Witness-Public-Key-Hash address encoding.
    """

    @staticmethod
    def EncodeKey(pub_key: Union[bytes, IPublicKey],
                  **kwargs: Any) -> str:
        """
        Encode a public key to P2WPKH address.

        Args:
            pub_key (bytes or IPublicKey): Public key bytes or object

        Other Parameters:
            hrp (str): HRP

        Returns:
            str: Address string

        Raises:
            ValueError: If the public key is not valid
            TypeError: If the public key is not secp256k1
        """
        hrp = kwargs["hrp"]

        pub_key_obj = AddrKeyValidator.ValidateAndGetSecp256k1Key(pub_key)
        return SegwitBech32Encoder.Encode(hrp,
                                          P2WPKHAddrConst.WITNESS_VER,
                                          Hash160.QuickDigest(pub_key_obj.RawCompressed().ToBytes()))


# Deprecated: only for compatibility, Encoder class shall be used instead
P2WPKHAddr = P2WPKHAddrEncoder
