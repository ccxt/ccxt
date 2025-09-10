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

"""Module for Near Protocol address encoding/decoding."""

# Imports
from typing import Any, Union

from bip_utils.addr.addr_dec_utils import AddrDecUtils
from bip_utils.addr.addr_key_validator import AddrKeyValidator
from bip_utils.addr.iaddr_decoder import IAddrDecoder
from bip_utils.addr.iaddr_encoder import IAddrEncoder
from bip_utils.ecc import Ed25519PublicKey, IPublicKey
from bip_utils.utils.misc import BytesUtils


class NearAddrDecoder(IAddrDecoder):
    """
    Near address decoder class.
    It allows the Near Protocol address decoding.
    """

    @staticmethod
    def DecodeAddr(addr: str,
                   **kwargs: Any) -> bytes:
        """
        Decode a Near Protocol address to bytes.

        Args:
            addr (str): Address string
            **kwargs  : Not used

        Returns:
            bytes: Public key bytes

        Raises:
            ValueError: If the address encoding is not valid
        """
        pub_key_bytes = BytesUtils.FromHexString(addr)
        # Validate length
        AddrDecUtils.ValidateLength(pub_key_bytes,
                                    Ed25519PublicKey.CompressedLength() - 1)
        # Validate public key
        AddrDecUtils.ValidatePubKey(pub_key_bytes, Ed25519PublicKey)

        return pub_key_bytes


class NearAddrEncoder(IAddrEncoder):
    """
    Near address encoder class.
    It allows the Near Protocol address encoding.
    """

    @staticmethod
    def EncodeKey(pub_key: Union[bytes, IPublicKey],
                  **kwargs: Any) -> str:
        """
        Encode a public key to Near Protocol address.

        Args:
            pub_key (bytes or IPublicKey): Public key bytes or object
            **kwargs                     : Not used

        Returns:
            str: Address string

        Raises:
            ValueError: If the public key is not valid
            TypeError: If the public key is not ed25519
        """

        # The address is simply the public key in hex format
        pub_key_obj = AddrKeyValidator.ValidateAndGetEd25519Key(pub_key)
        return pub_key_obj.RawCompressed().ToHex()[2:]


# Deprecated: only for compatibility, Encoder class shall be used instead
NearAddr = NearAddrEncoder
