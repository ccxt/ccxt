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

"""Module for SLIP32 net version class."""


class Slip32KeyNetVersions:
    """
    SLIP32 key net versions class.
    It represents a SLIP32 key net versions.
    """

    m_pub_net_ver: str
    m_priv_net_ver: str

    def __init__(self,
                 pub_net_ver: str,
                 priv_net_ver: str) -> None:
        """
        Construct class.

        Args:
            pub_net_ver (str) : Public net version
            priv_net_ver (str): Private net version
        """
        self.m_pub_net_ver = pub_net_ver
        self.m_priv_net_ver = priv_net_ver

    def Public(self) -> str:
        """
        Get public net version.

        Returns:
            str: Public net version
        """
        return self.m_pub_net_ver

    def Private(self) -> str:
        """
        Get private net version.

        Returns:
            str: Private net version
        """
        return self.m_priv_net_ver
