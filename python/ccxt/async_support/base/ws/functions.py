# -*- coding: utf-8 -*-

from zlib import decompress, MAX_WBITS
from gzip import GzipFile
from io import BytesIO


def inflate(data):
    return decompress(data, -MAX_WBITS)


def gunzip(data):
    return GzipFile('', 'rb', 9, BytesIO(data)).read().decode('utf-8')


def is_json_encoded_object(input):
    # deliberately NOT Exchange.is_json_encoded_object: the ws client feeds the
    # result straight into json.loads with no try/except, so a lone '{' or '['
    # frame must stay a plain string here (the base helper has no length guard)
    return (isinstance(input, str) and
            (len(input) >= 2) and
            ((input[0] == '{') or (input[0] == '[')))
