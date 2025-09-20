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

"""Module for converting Bitcoin Cash addresses."""

# Imports
from typing import Optional

from bip_utils.bech32 import BchBech32Decoder, BchBech32Encoder


class BchAddrConverter:
    """
    Bitcoin Cash address converter class.
    It allows to convert a Bitcoin Cash address by changing its HRP and net version.
    """

    @staticmethod
    def Convert(address: str,
                hrp: str,
                net_ver: Optional[bytes] = None) -> str:
        """
        Convert a Bitcoin Cash address by changing its HRP and net version.

        Args:
            address (str)            : Bitcoin Cash address
            hrp (str)                : New HRP
            net_ver (bytes, optional): New net version (if None, the old one will be used)

        Returns:
            str: Converted address string

        Raises:
            Bech32ChecksumError: If the address checksum is not valid
            ValueError: If the address string is not valid
        """

        # Decode address
        curr_net_ver, data = BchBech32Decoder.Decode(address[:address.find(":")], address)
        # Encode again with new HRP and net version
        return BchBech32Encoder.Encode(hrp, net_ver or curr_net_ver, data)
