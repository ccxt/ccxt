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

"""Module for Ripple address encoding/decoding."""

# Imports
from typing import Any, Union

from bip_utils.addr.iaddr_decoder import IAddrDecoder
from bip_utils.addr.iaddr_encoder import IAddrEncoder
from bip_utils.addr.P2PKH_addr import P2PKHAddrDecoder, P2PKHAddrEncoder
from bip_utils.base58 import Base58Alphabets
from bip_utils.coin_conf import CoinsConf
from bip_utils.ecc import IPublicKey


class XrpAddrDecoder(IAddrDecoder):
    """
    Ripple address decoder class.
    It allows the Ripple address decoding.
    """

    @staticmethod
    def DecodeAddr(addr: str,
                   **kwargs: Any) -> bytes:
        """
        Decode a Ripple address to bytes.

        Args:
            addr (str): Address string
            **kwargs  : Not used

        Returns:
            bytes: Public key hash bytes

        Raises:
            ValueError: If the address encoding is not valid
        """

        # Ripple address is just a P2PKH address with a different Base58 alphabet
        return P2PKHAddrDecoder.DecodeAddr(addr,
                                           net_ver=CoinsConf.Ripple.ParamByKey("p2pkh_net_ver"),
                                           base58_alph=Base58Alphabets.RIPPLE)


class XrpAddrEncoder(IAddrEncoder):
    """
    Ripple address encoder class.
    It allows the Ripple address encoding.
    """

    @staticmethod
    def EncodeKey(pub_key: Union[bytes, IPublicKey],
                  **kwargs: Any) -> str:
        """
        Encode a public key to Ripple address.

        Args:
            pub_key (bytes or IPublicKey): Public key bytes or object
            **kwargs                     : Not used

        Returns:
            str: Address string

        Raises:
            ValueError: If the public key is not valid
            TypeError: If the public key is not secp256k1
        """

        # Ripple address is just a P2PKH address with a different Base58 alphabet
        return P2PKHAddrEncoder.EncodeKey(pub_key,
                                          net_ver=CoinsConf.Ripple.ParamByKey("p2pkh_net_ver"),
                                          base58_alph=Base58Alphabets.RIPPLE)


# Deprecated: only for compatibility, Encoder class shall be used instead
XrpAddr = XrpAddrEncoder
