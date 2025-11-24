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

"""Module for BIP32 paths parsing and handling."""

# Import
from __future__ import annotations

from typing import Iterator, List, Optional, Sequence, Tuple, Union

from .bip32_ex import Bip32PathError
from .bip32_key_data import Bip32KeyIndex


class Bip32PathConst:
    """Class container for BIP32 path constants."""

    # Hardened characters
    HARDENED_CHARS: Tuple[str, str, str] = ("'", "h", "p")
    # Master character
    MASTER_CHAR: str = "m"


class Bip32Path:
    """
    BIP32 path class.
    It represents a BIP-0032 path.
    """

    m_elems: List[Bip32KeyIndex]
    m_is_absolute: bool

    def __init__(self,
                 elems: Optional[Sequence[Union[int, Bip32KeyIndex]]] = None,
                 is_absolute: bool = True) -> None:
        """
        Construct class.

        Args:
            elems (list, optional)      : Path elements (default: empty)
            is_absolute (bool, optional): True if path is an absolute one, false otherwise (default: True)
        """
        try:
            self.m_elems = ([]
                            if elems is None
                            else [Bip32KeyIndex(elem) if isinstance(elem, int) else elem for elem in elems])
        except ValueError as ex:
            raise Bip32PathError("The path contains some invalid key indexes") from ex

        self.m_is_absolute = is_absolute

    def AddElem(self,
                elem: Union[int, Bip32KeyIndex]) -> Bip32Path:
        """
        Return a new path object with the specified element added.

        Args:
            elem (str or Bip32KeyIndex): Path element

        Returns:
            Bip32Path object: Bip32Path object

        Raises:
            Bip32PathError: If the path element is not valid
        """
        if isinstance(elem, int):
            elem = Bip32KeyIndex(elem)
        return Bip32Path(self.m_elems + [elem], self.m_is_absolute)

    def IsAbsolute(self) -> bool:
        """
        Get if absolute path.

        Returns:
            bool: True if absolute path, false otherwise
        """
        return self.m_is_absolute

    def Length(self) -> int:
        """
        Get the number of elements of the path.

        Returns:
            int: Number of elements
        """
        return len(self.m_elems)

    def ToList(self) -> List[int]:
        """
        Get the path as a list of integers.

        Returns:
            list[int]: Path as a list of integers
        """
        return [int(elem) for elem in self.m_elems]

    def ToStr(self) -> str:
        """
        Get the path as a string.

        Returns:
            str: Path as a string
        """
        path_str = "" if not self.m_is_absolute else f"{Bip32PathConst.MASTER_CHAR}/"
        for elem in self.m_elems:
            if not elem.IsHardened():
                path_str += f"{str(elem.ToInt())}/"
            else:
                path_str += f"{str(Bip32KeyIndex.UnhardenIndex(elem.ToInt()))}'/"

        return path_str[:-1]

    def __str__(self) -> str:
        """
        Get the path as a string.

        Returns:
            str: Path as a string
        """
        return self.ToStr()

    def __getitem__(self,
                    idx: int) -> Bip32KeyIndex:
        """
        Get the specified element index.

        Args:
            idx (int): Element index

        Returns:
            Bip32KeyIndex object: Bip32KeyIndex object
        """
        return self.m_elems[idx]

    def __iter__(self) -> Iterator[Bip32KeyIndex]:
        """
        Get the iterator to the current element.

        Returns:
            Iterator object: Iterator to the current element
        """
        yield from self.m_elems


class Bip32PathParser:
    """
    BIP32 path parser class.
    It parses a BIP-0032 path and returns a Bip32Path object.
    """

    @staticmethod
    def Parse(path: str) -> Bip32Path:
        """
        Parse a path and return a Bip32Path object.

        Args:
            path (str): Path

        Returns:
            Bip32Path object: Bip32Path object

        Raises:
            Bip32PathError: If the path is not valid
        """

        # Remove trailing "/" if any
        if path.endswith("/"):
            path = path[:-1]

        # Parse elements
        return Bip32PathParser.__ParseElements(
            list(filter(None, path.split("/")))
        )

    @staticmethod
    def __ParseElements(path_elems: List[str]) -> Bip32Path:
        """
        Parse path elements and return a Bip32Path object.

        Args:
            path_elems (list[str]): Path elements

        Returns:
            Bip32Path object: Bip32Path object

        Raises:
            Bip32PathError: If the path is not valid
        """

        # Remove the initial "m" character if any
        if len(path_elems) > 0 and path_elems[0] == Bip32PathConst.MASTER_CHAR:
            path_elems = path_elems[1:]
            is_absolute = True
        else:
            is_absolute = False

        # Parse elements
        parsed_elems = list(map(Bip32PathParser.__ParseElem, path_elems))
        return Bip32Path(parsed_elems, is_absolute)

    @staticmethod
    def __ParseElem(path_elem: str) -> int:
        """
        Parse path element and get the correspondent index.

        Args:
            path_elem (str): Path element

        Returns:
            int: Index of the element, None if the element is not a valid index

        Raises:
            Bip32PathError: If the path is not valid
        """

        # Strip spaces
        path_elem = path_elem.strip()

        # Get if hardened
        is_hardened = path_elem.endswith(Bip32PathConst.HARDENED_CHARS)

        # If hardened, remove the last character from the string
        if is_hardened:
            path_elem = path_elem[:-1]

        # The remaining string shall be numeric
        if not path_elem.isnumeric():
            raise Bip32PathError(f"Invalid path element ({path_elem})")

        return int(path_elem) if not is_hardened else Bip32KeyIndex.HardenIndex(int(path_elem))
