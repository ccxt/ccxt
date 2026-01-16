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

"""Module with some bits utility functions."""


class BitUtils:
    """Class container for bit utility functions."""

    @staticmethod
    def IsBitSet(value: int,
                 bit_num: int) -> bool:
        """
        Get if the specified bit is set.

        Args:
            value (int)  : Value
            bit_num (int): Bit number to check

        Returns:
            bool: True if bit is set, false otherwise
        """
        return (value & (1 << bit_num)) != 0

    @staticmethod
    def AreBitsSet(value: int,
                   bit_mask: int) -> bool:
        """
        Get if the specified bits are set.

        Args:
            value (int)   : Value
            bit_mask (int): Bit mask to check

        Returns:
            bool: True if bit is set, false otherwise
        """
        return (value & bit_mask) != 0

    @staticmethod
    def SetBit(value: int,
               bit_num: int) -> int:
        """
        Set the specified bit.

        Args:
            value (int)  : Value
            bit_num (int): Bit number to set

        Returns:
            int: Value with the specified bit set
        """
        return value | (1 << bit_num)

    @staticmethod
    def SetBits(value: int,
                bit_mask: int) -> int:
        """
        Set the specified bits.

        Args:
            value (int)   : Value
            bit_mask (int): Bit mask to set

        Returns:
            int: Value with the specified bit set
        """
        return value | bit_mask

    @staticmethod
    def ResetBit(value: int,
                 bit_num: int) -> int:
        """
        Reset the specified bit.

        Args:
            value (int)  : Value
            bit_num (int): Bit number to reset

        Returns:
            int: Value with the specified bit reset
        """
        return value & ~(1 << bit_num)

    @staticmethod
    def ResetBits(value: int,
                  bit_mask: int) -> int:
        """
        Reset the specified bits.

        Args:
            value (int)   : Value
            bit_mask (int): Bit mask to reset

        Returns:
            int: Value with the specified bit reset
        """
        return value & ~bit_mask
