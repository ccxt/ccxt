from unittest import TestCase

from ..curve import secp256k1
from ..encoding.pem import PEMEncoder
from ..point import Point


class TestWhitespaceParsing(TestCase):
    d = 0x3007df8e8bed6c3592a10f9d0495173dcecbc99a40e8c88b47d7d590f8b608dd
    x = 0x2c071354794f38ff439eff52f8b475b0def34a210aa3b88a63f2a7295d35f41f
    y = 0xb0f35d4f45d95657fa37d6a5431be9441a95638fc710884f43fff7938428056e
    Q = Point(x, y, curve=secp256k1)

    def test_leading_newline(self):
        keypem = "\n-----BEGIN EC PRIVATE KEY-----\n" \
                 "MHQCAQEEIDAH346L7Ww1kqEPnQSVFz3Oy8maQOjIi0fX1ZD4tgjdoAcGBSuBBAAK\n" \
                 "oUQDQgAELAcTVHlPOP9Dnv9S+LR1sN7zSiEKo7iKY/KnKV019B+w811PRdlWV/o3\n" \
                 "1qVDG+lEGpVjj8cQiE9D//eThCgFbg==\n" \
                 "-----END EC PRIVATE KEY-----\n"
        key, pubkey = PEMEncoder.decode_private_key(keypem)
        self.assertEqual(key, self.d)
        self.assertEqual(pubkey, self.Q)

    def test_leading_trailing_newlines(self):
        keypem = "\n\n\n\n-----BEGIN EC PRIVATE KEY-----\n" \
                 "MHQCAQEEIDAH346L7Ww1kqEPnQSVFz3Oy8maQOjIi0fX1ZD4tgjdoAcGBSuBBAAK\n" \
                 "oUQDQgAELAcTVHlPOP9Dnv9S+LR1sN7zSiEKo7iKY/KnKV019B+w811PRdlWV/o3\n" \
                 "1qVDG+lEGpVjj8cQiE9D//eThCgFbg==\n" \
                 "-----END EC PRIVATE KEY-----\n\n\n\n"
        key, pubkey = PEMEncoder.decode_private_key(keypem)
        self.assertEqual(key, self.d)
        self.assertEqual(pubkey, self.Q)