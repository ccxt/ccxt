from hashlib import sha1, sha224, sha256, sha384, sha512
from unittest import TestCase

from ..util import RFC6979


class TestNonceGeneration(TestCase):
    def test_rfc_6979(self):
        msg = 'sample'
        x = 0x09A4D6792295A7F730FC3F2B49CBC0F62E862272F
        q = 0x4000000000000000000020108A2E0CC0D99F8A5EF

        expected = 0x09744429FA741D12DE2BE8316E35E84DB9E5DF1CD
        nonce = RFC6979(msg, x, q, sha1).gen_nonce()
        self.assertTrue(nonce == expected)

        expected = 0x323E7B28BFD64E6082F5B12110AA87BC0D6A6E159
        nonce = RFC6979(msg, x, q, sha224).gen_nonce()
        self.assertTrue(nonce == expected)

        expected = 0x23AF4074C90A02B3FE61D286D5C87F425E6BDD81B
        nonce = RFC6979(msg, x, q, sha256).gen_nonce()
        self.assertTrue(nonce == expected)

        expected = 0x2132ABE0ED518487D3E4FA7FD24F8BED1F29CCFCE
        nonce = RFC6979(msg, x, q, sha384).gen_nonce()
        self.assertTrue(nonce == expected)

        expected = 0x00BBCC2F39939388FDFE841892537EC7B1FF33AA3
        nonce = RFC6979(msg, x, q, sha512).gen_nonce()
        self.assertTrue(nonce == expected)