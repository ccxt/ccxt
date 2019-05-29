# coding: utf-8

"""
FFI helper compatibility functions. Exports the following items:

 - LibraryNotFoundError
 - FFIEngineError
 - bytes_from_buffer()
 - buffer_from_bytes()
 - null()
"""

from __future__ import unicode_literals, division, absolute_import, print_function

from ctypes import create_string_buffer


def buffer_from_bytes(initializer):
    return create_string_buffer(initializer)


def bytes_from_buffer(buffer, maxlen=None):
    return buffer.raw


def null():
    return None


class LibraryNotFoundError(Exception):

    """
    An exception when trying to find a shared library
    """

    pass


class FFIEngineError(Exception):

    """
    An exception when trying to instantiate ctypes or cffi
    """

    pass
