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

"""Module for base58-monero decoding/encoding."""

# Imports
from typing import List

from .base58 import Base58Alphabets, Base58Const, Base58Decoder, Base58Encoder


class Base58XmrConst:
    """Class container for Base58 Monero constants."""

    # Alphabet
    ALPHABET: str = Base58Const.ALPHABETS[Base58Alphabets.BITCOIN]

    # Block decoded maximum length in bytes
    BLOCK_DEC_MAX_BYTE_LEN: int = 8

    # Block encoded maximum length in bytes
    BLOCK_ENC_MAX_BYTE_LEN: int = 11
    # Block encoded lengths in bytes
    BLOCK_ENC_BYTE_LENS: List[int] = [0, 2, 3, 5, 6, 7, 9, 10, 11]


class Base58XmrEncoder:
    """
    Base58 Monero encoder class.
    It provides methods for encoding to Base58 format with Monero variation (encoding by blocks of 8-byte).
    """

    @staticmethod
    def Encode(data_bytes: bytes) -> str:
        """
        Encode bytes into a Base58 string with Monero variation.

        Args:
            data_bytes (bytes): Data bytes

        Returns:
            str: Encoded string
        """
        enc = ""

        # Get lengths
        data_len = len(data_bytes)
        block_dec_len = Base58XmrConst.BLOCK_DEC_MAX_BYTE_LEN

        # Compute total block count and last block length
        tot_block_cnt, last_block_enc_len = divmod(data_len, block_dec_len)

        # Encode each single block and pad
        for i in range(tot_block_cnt):
            block_enc = Base58Encoder.Encode(data_bytes[i * block_dec_len:(i + 1) * block_dec_len])
            enc += Base58XmrEncoder.__Pad(block_enc, Base58XmrConst.BLOCK_ENC_MAX_BYTE_LEN)

        # Encode last block and pad
        if last_block_enc_len > 0:
            block_enc = Base58Encoder.Encode(
                data_bytes[tot_block_cnt * block_dec_len:(tot_block_cnt * block_dec_len) + last_block_enc_len])
            enc += Base58XmrEncoder.__Pad(block_enc, Base58XmrConst.BLOCK_ENC_BYTE_LENS[last_block_enc_len])

        return enc

    @staticmethod
    def __Pad(enc_str: str,
              pad_len: int) -> str:
        """
        Pad the encoded string to the specified length.

        Args:
            enc_str (str): Encoded string
            pad_len (int): Pad length

        Returns:
            str: Padded string
        """
        return enc_str.rjust(pad_len, Base58XmrConst.ALPHABET[0])


class Base58XmrDecoder:
    """
    Base58 Monero decoder class.
    It provides methods for decoding Base58 format with Monero variation (encoding by blocks of 8-byte).
    """

    @staticmethod
    def Decode(data_str: str) -> bytes:
        """
        Decode bytes from a Base58 string with Monero variation.

        Args:
            data_str (str): Data string

        Returns:
            bytes: Decoded bytes
        """
        dec = b""

        # Get lengths
        data_len = len(data_str)
        block_dec_len = Base58XmrConst.BLOCK_DEC_MAX_BYTE_LEN
        block_enc_len = Base58XmrConst.BLOCK_ENC_MAX_BYTE_LEN

        # Compute block count and last block length
        tot_block_cnt, last_block_enc_len = divmod(data_len, block_enc_len)

        # Get last block decoded length
        last_block_dec_len = Base58XmrConst.BLOCK_ENC_BYTE_LENS.index(last_block_enc_len)

        # Decode each single block and unpad
        for i in range(tot_block_cnt):
            block_dec = Base58Decoder.Decode(data_str[(i * block_enc_len):((i + 1) * block_enc_len)])
            dec += Base58XmrDecoder.__UnPad(block_dec, block_dec_len)

        # Decode last block and unpad
        if last_block_enc_len > 0:
            block_dec = Base58Decoder.Decode(
                data_str[(tot_block_cnt * block_enc_len):((tot_block_cnt * block_enc_len) + last_block_enc_len)])
            dec += Base58XmrDecoder.__UnPad(block_dec, last_block_dec_len)

        return dec

    @staticmethod
    def __UnPad(dec_bytes: bytes,
                unpad_len: int) -> bytes:
        """
        Unpad the decoded string to the specified length.

        Args:
            dec_bytes (bytes): Decoded bytes
            unpad_len (int): Unpad length

        Returns:
            bytes: Unpadded string
        """
        return dec_bytes[len(dec_bytes) - unpad_len:len(dec_bytes)]
