import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
sys.path.append(root)

# -*- coding: utf-8 -*-

from ccxt.base.precise import Precise

def test_precise_orn():
    # Test the orn method (bitwise OR) for Precise integers
    a = Precise('5')  # binary 101
    b = Precise('3')  # binary 011
    result = a.orn(b)
    assert str(result) == '7'  # 101 | 011 = 111 = 7

    # Test string_or static method
    assert Precise.string_or('5', '3') == '7'
    assert Precise.string_or('10', '5') == '15'  # 1010 | 0101 = 1111 = 15
    assert Precise.string_or('0', '0') == '0'
    assert Precise.string_or('7', '0') == '7'

    # Test None handling
    assert Precise.string_or(None, '3') is None
    assert Precise.string_or('5', None) is None
    assert Precise.string_or(None, None) is None
