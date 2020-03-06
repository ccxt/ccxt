# -*- coding: utf-8 -*-

from zlib import decompress, MAX_WBITS
from base64 import b64decode
from gzip import GzipFile
from io import BytesIO


def inflate(string):
    return decompress(b64decode(string), -MAX_WBITS)


def gunzip(data):
    return GzipFile('', 'rb', 9, BytesIO(data)).read().decode('utf-8')
