# -*- coding: utf-8 -*-

# THIS IS A MOCKUP FILE IN PROGRESS

# import argparse
import os
import sys
from pprint import pprint
# import json
# import time

# ------------------------------------------------------------------------------

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(root)

# ------------------------------------------------------------------------------

import ccxt  # noqa: E402

# ------------------------------------------------------------------------------

values = [
    {
        'a': 1,
        'b': 2,
        'd': {
            'a': 1,
            'b': [],
            'c': {'test1': 123, 'test2': 321}},
        'f': 5,
        'g': 123,
        'i': 321,
        'j': [1, 2],
    },
    {
        'b': 3,
        'c': 5,
        'd': {
            'b': {'first': 'one', 'second': 'two'},
            'c': {'test2': 222}},
        'e': {'one': 1, 'two': 2},
        'f': [{'foo': 'bar'}],
        'g': None,
        'h': r'abc',
        'i': None,
        'j': [3, 4]
    }
]

pprint(ccxt.Exchange.deep_extend(*values))

# assert.deepEqual ({
#     a: 1,
#     b: 3,
#     d: {
#         a: 1,
#         b: {first: 'one', second: 'two'},
#         c: {test1: 123, test2: 222}
#     },
#     f: [{'foo': 'bar'}],
#     g: undefined,
#     c: 5,
#     e: {one: 1, two: 2},
#     h: /abc/g,
#     i: null,
#     j: [3, 4]
# }, extended)
