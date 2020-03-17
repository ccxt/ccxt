# -*- coding: utf-8 -*-

from zlib import decompress, MAX_WBITS
from base64 import b64decode
from gzip import GzipFile
from io import BytesIO


def inflate(data):
    return decompress(data, -MAX_WBITS).decode('utf-8')


def inflate64(data):
    return inflate(b64decode(data))


def gunzip(data):
    return GzipFile('', 'rb', 9, BytesIO(data)).read().decode('utf-8')
