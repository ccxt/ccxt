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

"""Module for AES-ECB encryption/decryption."""


#
# Imports
#
from typing import Any, Union

from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad

from ..misc.algo import AlgoUtils


#
# Classes
#

class AesEcbEncrypter:
    """
    AES-ECB encrypter class.
    It encrypts data using AES-ECB algorithm.
    """

    aes: Any
    auto_pad: bool

    # Constructor
    def __init__(self,
                 key: Union[str, bytes]) -> None:
        """
        Construct class.

        Args:
            key (str or bytes): AES key
        """
        self.aes = AES.new(AlgoUtils.Encode(key), AES.MODE_ECB)
        self.auto_pad = True

    def AutoPad(self,
                value: bool) -> None:
        """
        Set the auto-pad flag.

        Args:
            value (bool): Flag value
        """
        self.auto_pad = value

    def Encrypt(self,
                data: Union[str, bytes]) -> bytes:
        """
        Encrypt data using AES-ECB algorithm.

        Args:
            data (str or bytes): Data to be encrypted

        Returns:
            bytes: Encrypted data
        """
        padded_data = self.Pad(data) if self.auto_pad else AlgoUtils.Encode(data)
        return self.aes.encrypt(padded_data)

    @staticmethod
    def Pad(data: Union[str, bytes]) -> bytes:
        """
        Pad data using PKCS7 algorithm.

        Args:
            data (str or bytes): Data to be padded

        Returns:
            bytes: Padded data
        """
        return pad(AlgoUtils.Encode(data), AES.block_size)


class AesEcbDecrypter:
    """
    AES-ECB decrypter class.
    It decrypts data using AES-ECB algorithm.
    """

    aes: Any

    def __init__(self,
                 key: Union[str, bytes]) -> None:
        """
        Construct class.

        Args:
            key (str or bytes): AES key
        """
        self.aes = AES.new(AlgoUtils.Encode(key), AES.MODE_ECB)
        self.auto_unpad = True

    def AutoUnPad(self,
                  value: bool) -> None:
        """
        Set the auto-unpad flag.

        Args:
            value (bool): Flag value
        """
        self.auto_unpad = value

    def Decrypt(self,
                data: bytes) -> bytes:
        """
        Decrypt data using AES-ECB algorithm.

        Args:
            data (bytes): Data to be decrypted

        Returns:
            bytes: Decrypted data
        """
        dec = self.aes.decrypt(data)
        return self.UnPad(dec) if self.auto_unpad else dec

    @staticmethod
    def UnPad(data: bytes) -> bytes:
        """
        Unpad data using PKCS7 algorithm.

        Args:
            data (bytes): Data to be unpadded

        Returns:
            bytes: Unpadded data
        """
        return unpad(data, AES.block_size)
