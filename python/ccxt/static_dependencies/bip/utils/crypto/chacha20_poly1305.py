# Copyright (c) 2022 Emanuele Bellocchia
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

"""Module for ChaCha20-Poly1305 algorithm."""

# Imports
from typing import Tuple, Union

from Crypto.Cipher import ChaCha20_Poly1305

from ..misc import AlgoUtils


class ChaCha20Poly1305:
    """
    ChaCha20-Poly1305 class.
    It decrypts/encrypts data using ChaCha20-Poly1305 algorithm.
    """

    @staticmethod
    def Decrypt(key: Union[bytes, str],
                nonce: Union[bytes, str],
                assoc_data: Union[bytes, str],
                cipher_text: Union[bytes, str],
                tag: Union[bytes, str]) -> bytes:
        """
        Decrypt data.

        Args:
            key (str or bytes)       : Key
            nonce (str or bytes)     : Nonce
            assoc_data (str or bytes): Associated data
            cipher_text (bytes)      : Cipher text
            tag (bytes)              : Tag

        Returns:
            bytes: Decrypted data
        """
        cipher = ChaCha20_Poly1305.new(key=AlgoUtils.Encode(key),
                                       nonce=AlgoUtils.Encode(nonce))
        cipher.update(AlgoUtils.Encode(assoc_data))
        return cipher.decrypt_and_verify(AlgoUtils.Encode(cipher_text), AlgoUtils.Encode(tag))

    @staticmethod
    def Encrypt(key: Union[bytes, str],
                nonce: Union[bytes, str],
                assoc_data: Union[bytes, str],
                plain_text: Union[bytes, str]) -> Tuple[bytes, bytes]:
        """
        Encrypt data.

        Args:
            key (str or bytes)       : Key
            nonce (str or bytes)     : Nonce
            assoc_data (str or bytes): Associated data
            plain_text (str or bytes): Plain text

        Returns:
            tuple[bytes, bytes]: Cipher text bytes (index 0) and tag bytes (index 1)
        """
        cipher = ChaCha20_Poly1305.new(key=AlgoUtils.Encode(key),
                                       nonce=AlgoUtils.Encode(nonce))
        cipher.update(AlgoUtils.Encode(assoc_data))
        return cipher.encrypt_and_digest(AlgoUtils.Encode(plain_text))

    @staticmethod
    def KeySize() -> int:
        """
        Get the key size.

        Returns:
            int: Key size
        """
        return ChaCha20_Poly1305.key_size

    @staticmethod
    def TagSize() -> int:
        """
        Get the tag size.

        Returns:
            int: Tag size
        """
        return 16
