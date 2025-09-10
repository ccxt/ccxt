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

"""Module for Zilliqa address encoding/decoding."""

# Imports
from typing import Any, Union

from bip_utils.addr.addr_dec_utils import AddrDecUtils
from bip_utils.addr.addr_key_validator import AddrKeyValidator
from bip_utils.addr.iaddr_decoder import IAddrDecoder
from bip_utils.addr.iaddr_encoder import IAddrEncoder
from bip_utils.bech32 import Bech32ChecksumError, Bech32Decoder, Bech32Encoder
from bip_utils.coin_conf import CoinsConf
from bip_utils.ecc import IPublicKey
from bip_utils.utils.crypto import Sha256


class ZilAddrConst:
    """Class container for Zilliqa address constants."""

    # SHA-256 length in bytes
    SHA256_BYTE_LEN: int = 20


class ZilAddrDecoder(IAddrDecoder):
    """
    Zilliqa address decoder class.
    It allows the Zilliqa address decoding.
    """

    @staticmethod
    def DecodeAddr(addr: str,
                   **kwargs: Any) -> bytes:
        """
        Decode a Zilliqa address to bytes.

        Args:
            addr (str): Address string
            **kwargs  : Not used

        Returns:
            bytes: Public key hash bytes

        Raises:
            ValueError: If the address encoding is not valid
        """
        try:
            addr_dec_bytes = Bech32Decoder.Decode(CoinsConf.Zilliqa.ParamByKey("addr_hrp"),
                                                  addr)
        except Bech32ChecksumError as ex:
            raise ValueError("Invalid bech32 checksum") from ex

        AddrDecUtils.ValidateLength(addr_dec_bytes, ZilAddrConst.SHA256_BYTE_LEN)
        return addr_dec_bytes


class ZilAddrEncoder(IAddrEncoder):
    """
    Zilliqa address encoder class.
    It allows the Zilliqa address encoding.
    """

    @staticmethod
    def EncodeKey(pub_key: Union[bytes, IPublicKey],
                  **kwargs: Any) -> str:
        """
        Encode a public key to Zilliqa address.

        Args:
            pub_key (bytes or IPublicKey): Public key bytes or object
            **kwargs                     : Not used

        Returns:
            str: Address string

        Raises:
            ValueError: If the public key is not valid
            TypeError: If the public key is not secp256k1
        """
        pub_key_obj = AddrKeyValidator.ValidateAndGetSecp256k1Key(pub_key)

        key_hash = Sha256.QuickDigest(pub_key_obj.RawCompressed().ToBytes())
        return Bech32Encoder.Encode(CoinsConf.Zilliqa.ParamByKey("addr_hrp"),
                                    key_hash[-ZilAddrConst.SHA256_BYTE_LEN:])


# Deprecated: only for compatibility, Encoder class shall be used instead
ZilAddr = ZilAddrEncoder
