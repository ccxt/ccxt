from binascii import unhexlify
from random import randint
from unittest import TestCase

from .. import CURVES
from fastecdsa.curve import secp256k1
from fastecdsa.ecdsa import sign
from fastecdsa.encoding.der import DEREncoder, InvalidDerSignature


class TestDEREncoder(TestCase):
    def test_encode_signature(self):
        self.assertEqual(
            DEREncoder.encode_signature(r=1, s=2),
            b"\x30"   # SEQUENCE
            b"\x06"   # Length of Sequence
            b"\x02"   # INTEGER
            b"\x01"   # Length of r
            b"\x01"   # r
            b"\x02"   # INTEGER
            b"\x01"   # Length of s
            b"\x02",  # s
        )

        # Check that we add a zero byte when the number's highest bit is set
        self.assertEqual(DEREncoder.encode_signature(r=128, s=128), b"0\x08\x02\x02\x00\x80\x02\x02\x00\x80")

        # Check a value on a standard curve like secp256k1 works
        # see https://github.com/btccom/secp256k1-go/blob/master/secp256k1/sign_vectors.yaml
        secp256k1_vectors = [
            (
                0x31a84594060e103f5a63eb742bd46cf5f5900d8406e2726dedfc61c7cf43ebad,
                unhexlify("9e5755ec2f328cc8635a55415d0e9a09c2b6f2c9b0343c945fbbfe08247a4cbe"),
                unhexlify("30440220132382ca59240c2e14ee7ff61d90fc63276325f4cbe8169fc53ade4a407c2fc802204d86fbe3bde69"
                          "75dd5a91fdc95ad6544dcdf0dab206f02224ce7e2b151bd82ab"),
            ),
            (
                0x7177f0d04c79fa0b8c91fe90c1cf1d44772d1fba6e5eb9b281a22cd3aafb51fe,
                unhexlify("2d46a712699bae19a634563d74d04cc2da497b841456da270dccb75ac2f7c4e7"),
                unhexlify("3045022100d80cf7abc9ab601373780cee3733d2cb5ff69ba1452ec2d2a058adf9645c13be0220011d1213b7d"
                          "152f72fd8759b45276ba32d9c909602e5ec89550baf3aaa8ed950"),
            ),
            (
                0x989e500d6b1397f2c5dcdf43c58ac2f14df753eb6089654e07ff946b3f84f3d5,
                unhexlify("c94f4ec84be928017cbbb447d2ab5b5d4d69e5e5fd03da7eae4378a1b1c9c402"),
                unhexlify("3045022100d0f5b740cbe3ee5b098d3c5afdefa61bb0797cb4e7b596afbd38174e1c653bb602200329e9f1a09"
                          "632de477664814791ac31544e04715db68f4b02657ba35863e711"),
            ),
            (
                0x39dfc615f2b718397f6903b0c46c47c5687e97d3d2a5e1f2b200f459f7b1219b,
                unhexlify("dfeb2092955572ce0695aa038f58df5499949e18f58785553c3e83343cd5eb93"),
                unhexlify("30440220692c01edf8aeab271df3ed4e8d57a170f014f8f9d65031aac28b5e1840acfb5602205075f9d1fdbf5"
                          "079ee052e5f3572d518b3594ef49582899ec44d065f71a55192"),
            ),
        ]

        for private_key, digest, expected in secp256k1_vectors:
            r, s = sign(digest, private_key, curve=secp256k1, prehashed=True)
            encoded = DEREncoder.encode_signature(r, s)
            self.assertEqual(encoded, expected)

    def test_decode_signature(self):
        with self.assertRaises(InvalidDerSignature):
            DEREncoder.decode_signature(b"")  # length too short
        with self.assertRaises(InvalidDerSignature):
            DEREncoder.decode_signature(b"\x31\x06\x02\x01\x01\x02\x01\x02")  # invalid SEQUENCE marker
        with self.assertRaises(InvalidDerSignature):
            DEREncoder.decode_signature(b"\x30\x07\x02\x01\x01\x02\x01\x02")  # invalid length (too short)
        with self.assertRaises(InvalidDerSignature):
            DEREncoder.decode_signature(b"\x30\x05\x02\x01\x01\x02\x01\x02")  # invalid length (too long)
        with self.assertRaises(InvalidDerSignature):
            DEREncoder.decode_signature(b"\x30\x06\x02\x03\x01\x02\x01\x02")  # invalid length of r
        with self.assertRaises(InvalidDerSignature):
            DEREncoder.decode_signature(b"\x30\x06\x02\x01\x01\x02\x03\x02")  # invalid length of s
        with self.assertRaises(InvalidDerSignature):
            DEREncoder.decode_signature(b"\x30\x06\x03\x01\x01\x02\x01\x02")  # invalid INTEGER marker for r
        with self.assertRaises(InvalidDerSignature):
            DEREncoder.decode_signature(b"\x30\x06\x02\x00\x02\x01\x02")  # length of r is 0
        with self.assertRaises(InvalidDerSignature):
            DEREncoder.decode_signature(b"\x30\x06\x02\x01\x81\x02\x01\x02")  # value of r is negative
        with self.assertRaises(InvalidDerSignature):
            DEREncoder.decode_signature(b"\x30\x07\x02\x02\x00\x01\x02\x01\x02")  # value of r starts with a zero byte
        with self.assertRaises(InvalidDerSignature):
            DEREncoder.decode_signature(b"\x30\x06\x02\x01\x01\x03\x01\x02")  # invalid INTEGER marker for s
        with self.assertRaises(InvalidDerSignature):
            DEREncoder.decode_signature(b"\x30\x06\x02\x01\x01\x02\x00")  # value of s is 0
        with self.assertRaises(InvalidDerSignature):
            DEREncoder.decode_signature(b"\x30\x06\x02\x01\x01\x02\x01\x81")  # value of s is negative
        with self.assertRaises(InvalidDerSignature):
            DEREncoder.decode_signature(b"\x30\x07\x02\x01\x01\x02\x02\x00\x02")  # value of s starts with a zero byte

        self.assertEqual(DEREncoder.decode_signature(b"\x30\x06\x02\x01\x01\x02\x01\x02"), (1, 2))
        self.assertEqual(
            DEREncoder.decode_signature(b"0\x08\x02\x02\x00\x80\x02\x02\x00\x80"), (128, 128)
        )  # verify zero bytes
        self.assertEqual(
            DEREncoder.decode_signature(b"0\x08\x02\x02\x03\xE8\x02\x02\x03\xE8"), (1000, 1000)
        )  # verify byte order

    def test_encode_decode_all_curves(self):
        for curve in CURVES:
            d = randint(1, curve.q)
            Q = d * curve.G
            r, s = sign("sign me", d, curve=curve)

            encoded = DEREncoder.encode_signature(r, s)
            decoded_r, decoded_s = DEREncoder.decode_signature(encoded)

            self.assertEqual(decoded_r, r)
            self.assertEqual(decoded_s, s)

