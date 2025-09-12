
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

"""Module for Elrond address encoding/decoding."""

# Imports
from typing import Any, Union

from bip_utils.addr.addr_dec_utils import AddrDecUtils
from bip_utils.addr.addr_key_validator import AddrKeyValidator
from bip_utils.addr.iaddr_decoder import IAddrDecoder
from bip_utils.addr.iaddr_encoder import IAddrEncoder
from bip_utils.bech32 import Bech32ChecksumError, Bech32Decoder, Bech32Encoder
from bip_utils.coin_conf import CoinsConf
from bip_utils.ecc import Ed25519PublicKey, IPublicKey


class EgldAddrDecoder(IAddrDecoder):
    """
    Elrond address decoder class.
    It allows the Elrond address decoding.
    """

    @staticmethod
    def DecodeAddr(addr: str,
                   **kwargs: Any) -> bytes:
        """
        Decode an Elrond address to bytes.

        Args:
            addr (str): Address string
            **kwargs  : Not used

        Returns:
            bytes: Public key bytes

        Raises:
            ValueError: If the address encoding is not valid
        """
        try:
            addr_dec_bytes = Bech32Decoder.Decode(CoinsConf.Elrond.ParamByKey("addr_hrp"),
                                                  addr)
        except Bech32ChecksumError as ex:
            raise ValueError("Invalid bech32 checksum") from ex

        AddrDecUtils.ValidateLength(addr_dec_bytes,
                                    Ed25519PublicKey.CompressedLength() - 1)
        AddrDecUtils.ValidatePubKey(addr_dec_bytes, Ed25519PublicKey)

        return addr_dec_bytes


class EgldAddrEncoder(IAddrEncoder):
    """
    Elrond address encoder class.
    It allows the Elrond address encoding.
    """

    @staticmethod
    def EncodeKey(pub_key: Union[bytes, IPublicKey],
                  **kwargs: Any) -> str:
        """
        Encode a public key to Elrond address.

        Args:
            pub_key (bytes or IPublicKey): Public key bytes or object
            **kwargs                     : Not used

        Returns:
            str: Address string

        Raises:
            ValueError: If the public key is not valid
            TypeError: If the public key is not ed25519
        """
        pub_key_obj = AddrKeyValidator.ValidateAndGetEd25519Key(pub_key)
        return Bech32Encoder.Encode(CoinsConf.Elrond.ParamByKey("addr_hrp"),
                                    pub_key_obj.RawCompressed().ToBytes()[1:])


# Deprecated: only for compatibility, Encoder class shall be used instead
EgldAddr = EgldAddrEncoder
