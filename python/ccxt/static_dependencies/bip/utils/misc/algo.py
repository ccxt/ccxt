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

"""Module with some algorithm utility functions."""

# Imports
from bisect import bisect_left
from typing import Any, List, Union


class AlgoUtils:
    """Class container for algorithm utility functions."""

    @staticmethod
    def BinarySearch(arr: List,
                     elem: Any) -> int:
        """
        Binary search algorithm simply implemented by using the bisect library.

        Args:
            arr (list): list of elements
            elem (any): element to be searched

        Returns:
            int: First index of the element, -1 if not found
        """

        invalid_idx = -1

        i = bisect_left(arr, elem)
        if i != len(arr) and arr[i] == elem:
            return i

        return invalid_idx

    @staticmethod
    def Decode(data: Union[bytes, str],
               encoding: str = "utf-8") -> str:
        """
        Decode from bytes.

        Args:
            data (str or bytes): Data
            encoding (str)     : Encoding type

        Returns:
            str: String encoded to bytes

        Raises:
            TypeError: If the data is neither string nor bytes
        """
        if isinstance(data, str):
            return data
        if isinstance(data, bytes):
            return data.decode(encoding)
        raise TypeError("Invalid data type")

    @staticmethod
    def Encode(data: Union[bytes, str],
               encoding: str = "utf-8") -> bytes:
        """
        Encode to bytes.

        Args:
            data (str or bytes): Data
            encoding (str)     : Encoding type

        Returns:
            bytes: String encoded to bytes

        Raises:
            TypeError: If the data is neither string nor bytes
        """
        if isinstance(data, str):
            return data.encode(encoding)
        if isinstance(data, bytes):
            return data
        raise TypeError("Invalid data type")

    @staticmethod
    def IsStringMixed(data_str: str) -> bool:
        """
        Get if the specified string is in mixed case.

        Args:
            data_str (str): string

        Returns:
            bool: True if mixed case, false otherwise
        """
        return any(c.islower() for c in data_str) and any(c.isupper() for c in data_str)
