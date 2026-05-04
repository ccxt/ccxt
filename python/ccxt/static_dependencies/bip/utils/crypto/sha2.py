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
from typing import Any, Union

from Crypto.Hash import SHA512

from ..misc import AlgoUtils


HASHLIB_USE_SHA512_256: bool = "sha512_256" in hashlib.algorithms_available


class Sha256:
    """
    SHA256 class.
    It computes digests using SHA256 algorithm.
    """

    handle: Any

    def __init__(self) -> None:
        """Construct class."""
        self.handle = hashlib.sha256()

    def Update(self,
               data_bytes: bytes) -> None:
        """
        Update digest.

        Args:
            data_bytes (bytes): Data bytes
        """
        self.handle.update(data_bytes)

    def Digest(self) -> bytes:
        """
        Get the computed digest.

        Returns:
            bytes: Computed digest
        """
        return self.handle.digest()

    @staticmethod
    def QuickDigest(data: Union[bytes, str]) -> bytes:
        """
        Compute the digest (quick version).

        Args:
            data (str or bytes): Data

        Returns:
            bytes: Computed digest
        """
        return hashlib.sha256(AlgoUtils.Encode(data)).digest()

    @staticmethod
    def DigestSize() -> int:
        """
        Get the digest size in bytes.

        Returns:
            int: Digest size in bytes
        """
        return hashlib.sha256().digest_size


class DoubleSha256:
    """
    Double SHA256 class.
    It computes digests using SHA256 algorithm twice.
    """

    @staticmethod
    def QuickDigest(data: Union[bytes, str]) -> bytes:
        """
        Compute the digest (quick version).

        Args:
            data (str or bytes): Data

        Returns:
            bytes: Computed digest
        """
        return Sha256.QuickDigest(Sha256.QuickDigest(data))

    @staticmethod
    def DigestSize() -> int:
        """
        Get the digest size in bytes.

        Returns:
            int: Digest size in bytes
        """
        return Sha256.DigestSize()


class Sha512:
    """
    SHA512 class.
    It computes digests using SHA512 algorithm.
    """

    @staticmethod
    def QuickDigest(data: Union[bytes, str]) -> bytes:
        """
        Compute the digest (quick version).

        Args:
            data (str or bytes): Data

        Returns:
            bytes: Computed digest
        """
        return hashlib.sha512(AlgoUtils.Encode(data)).digest()

    @staticmethod
    def DigestSize() -> int:
        """
        Get the digest size in bytes.

        Returns:
            int: Digest size in bytes
        """
        return hashlib.sha512().digest_size


class Sha512_256:   # noqa: N801
    """
    SHA512/256 class.
    It computes digests using SHA512/256 algorithm.
    """

    @staticmethod
    def QuickDigest(data: Union[bytes, str]) -> bytes:
        """
        Compute the digest (quick version).

        Args:
            data (str or bytes): Data

        Returns:
            bytes: Computed digest
        """
        if HASHLIB_USE_SHA512_256:
            return hashlib.new("sha512_256", AlgoUtils.Encode(data)).digest()
        # Use Cryptodome if not implemented in hashlib
        return SHA512.new(AlgoUtils.Encode(data), truncate="256").digest()

    @staticmethod
    def DigestSize() -> int:
        """
        Get the digest size in bytes.

        Returns:
            int: Digest size in bytes
        """
        return (hashlib.new("sha512_256").digest_size
                if HASHLIB_USE_SHA512_256
                else SHA512.new(truncate="256").digest_size)
