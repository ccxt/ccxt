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

"""Module with helper class for generic coins configuration handling."""

# Imports
from typing import Any, Dict

from ..utils.conf import CoinNames as ConfCoinNames


class CoinConf:
    """Coin configuration class."""

    m_coin_name: ConfCoinNames
    m_params: Dict[str, Any]

    def __init__(self,
                 coin_name: ConfCoinNames,
                 params: Dict[str, Any]) -> None:
        """
        Construct class.

        Args:
            coin_name (CoinNames object): Coin names
            params (dict)               : SS58 format
        """
        self.m_coin_name = coin_name
        self.m_params = params

    def CoinNames(self) -> ConfCoinNames:
        """
        Get coin names.

        Returns:
            CoinNames object: CoinNames object
        """
        return self.m_coin_name

    def ParamByKey(self,
                   key: str) -> Any:
        """
        Get the parameter by key.

        Args:
            key (str): Parameter key

        Returns:
            Any: Parameter value
        """
        return self.m_params[key]
