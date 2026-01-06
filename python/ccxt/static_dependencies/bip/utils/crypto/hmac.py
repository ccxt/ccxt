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

"""Module for SHA-2 algorithms."""

# Imports
import hashlib
import hmac
from typing import Tuple, Union

from ..misc import AlgoUtils


HMAC_USE_DIGEST: bool = hasattr(hmac, "digest")


class HmacSha256:
    """
    HMAC-SHA256 class.
    It computes digests using HMAC-SHA256 algorithm.
    """

    @staticmethod
    def QuickDigest(key: Union[bytes, str],
                    data: Union[bytes, str]) -> bytes:
        """
        Compute the digest (quick version).

        Args:
            key (str or bytes) : Key
            data (str or bytes): Data

        Returns:
            bytes: Computed digest
        """
        # Use digest if available
        if HMAC_USE_DIGEST:
            return hmac.digest(AlgoUtils.Encode(key), AlgoUtils.Encode(data), "sha256")
        return hmac.new(AlgoUtils.Encode(key), AlgoUtils.Encode(data), hashlib.sha256).digest()

    @staticmethod
    def DigestSize() -> int:
        """
        Get the digest size in bytes.

        Returns:
            int: Digest size in bytes
        """
        return hashlib.sha256().digest_size


class HmacSha512:
    """
    HMAC-SHA512 class.
    It computes digests using HMAC-SHA512 algorithm.
    """

    @staticmethod
    def QuickDigest(key: Union[bytes, str],
                    data: Union[bytes, str]) -> bytes:
        """
        Compute the digest (quick version).

        Args:
            key (str or bytes) : Key
            data (str or bytes): Data

        Returns:
            bytes: Computed digest
        """

        # Use digest if available
        if HMAC_USE_DIGEST:
            return hmac.digest(AlgoUtils.Encode(key), AlgoUtils.Encode(data), "sha512")
        return hmac.new(AlgoUtils.Encode(key), AlgoUtils.Encode(data), hashlib.sha512).digest()

    @staticmethod
    def QuickDigestHalves(key: Union[bytes, str],
                          data: Union[bytes, str]) -> Tuple[bytes, bytes]:
        """
        Compute the digest and return it split into two halves (quick version).

        Args:
            key (str or bytes) : Key
            data (str or bytes): Data

        Returns:
            tuple[bytes, bytes]: Computed digest left part (index 0) and right part (index 1)
        """
        digest_bytes = HmacSha512.QuickDigest(key, data)
        return digest_bytes[:HmacSha512.DigestSize() // 2], digest_bytes[HmacSha512.DigestSize() // 2:]

    @staticmethod
    def DigestSize() -> int:
        """
        Get the digest size in bytes.

        Returns:
            int: Digest size in bytes
        """
        return hashlib.sha512().digest_size
