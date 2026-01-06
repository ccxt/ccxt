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

"""Module with helper class for coin names."""


class CoinNames:
    """Helper class for representing coin names."""

    m_name: str
    m_abbr: str

    def __init__(self,
                 name: str,
                 abbr: str) -> None:
        """
        Construct class.

        Args:
            name (str): Name
            abbr (str): Abbreviation
        """
        self.m_name = name
        self.m_abbr = abbr

    def Name(self) -> str:
        """
        Get name.

        Returns :
            str: Name
        """
        return self.m_name

    def Abbreviation(self) -> str:
        """
        Get abbreviation.

        Returns:
            str: Abbreviation
        """
        return self.m_abbr
