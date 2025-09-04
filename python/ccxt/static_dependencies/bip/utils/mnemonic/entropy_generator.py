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

"""Module for generic entropy generator."""

# Imports
import os
import secrets

from ..misc import IntegerUtils


class EntropyGenerator:
    """
    Entropy generator class.
    It generates random entropy bytes with the specified length.
    """

    m_bit_len: int

    def __init__(self,
                 bit_len: int) -> None:
        """
        Construct class.

        Args:
            bit_len (int): Entropy length in bits
        """
        self.m_bit_len = bit_len

    def Generate(self) -> bytes:
        """
        Generate random entropy bytes.

        Returns:
            bytes: Generated entropy bytes
        """
        return (os.urandom(self.m_bit_len // 8)
                if self.m_bit_len % 8 == 0
                else IntegerUtils.ToBytes(secrets.randbits(self.m_bit_len)))
