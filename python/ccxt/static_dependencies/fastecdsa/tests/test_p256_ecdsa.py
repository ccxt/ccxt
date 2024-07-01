from hashlib import sha1, sha224, sha256, sha384, sha512
from unittest import TestCase

from ..curve import P256
from ..ecdsa import sign, verify
from ..point import Point


class TestP256ECDSA(TestCase):
    """ case taken from http://tools.ietf.org/html/rfc6979#appendix-A.2.5 """

    def test_ecdsa_P256_SHA1_sign(self):
        d = 0xC9AFA9D845BA75166B5C215767B1D6934E50C3DB36E89B127B8A622B120F6721
        expected = (
            0x61340C88C3AAEBEB4F6D667F672CA9759A6CCAA9FA8811313039EE4A35471D32,
            0x6D7F147DAC089441BB2E2FE8F7A3FA264B9C475098FDCF6E00D7C996E1B8B7EB,
        )
        sig = sign('sample', d, curve=P256, hashfunc=sha1)
        self.assertEqual(sig, expected)

        Q = d * P256.G
        self.assertTrue(verify(sig, 'sample', Q, curve=P256, hashfunc=sha1))

    """ case taken from http://tools.ietf.org/html/rfc6979#appendix-A.2.5 """

    def test_ecdsa_P256_SHA224_sign(self):
        d = 0xC9AFA9D845BA75166B5C215767B1D6934E50C3DB36E89B127B8A622B120F6721
        expected = (
            0x53B2FFF5D1752B2C689DF257C04C40A587FABABB3F6FC2702F1343AF7CA9AA3F,
            0xB9AFB64FDC03DC1A131C7D2386D11E349F070AA432A4ACC918BEA988BF75C74C
        )
        sig = sign('sample', d, curve=P256, hashfunc=sha224)
        self.assertEqual(sig, expected)

        Q = d * P256.G
        self.assertTrue(verify(sig, 'sample', Q, curve=P256, hashfunc=sha224))

    """ case taken from http://tools.ietf.org/html/rfc6979#appendix-A.2.5 """

    def test_ecdsa_P256_SHA2_sign(self):
        d = 0xC9AFA9D845BA75166B5C215767B1D6934E50C3DB36E89B127B8A622B120F6721
        expected = (
            0xEFD48B2AACB6A8FD1140DD9CD45E81D69D2C877B56AAF991C34D0EA84EAF3716,
            0xF7CB1C942D657C41D436C7A1B6E29F65F3E900DBB9AFF4064DC4AB2F843ACDA8
        )
        sig = sign('sample', d, curve=P256, hashfunc=sha256)
        self.assertEqual(sig, expected)

        Q = d * P256.G
        self.assertTrue(verify(sig, 'sample', Q, curve=P256, hashfunc=sha256))

    """ case taken from http://tools.ietf.org/html/rfc6979#appendix-A.2.5 """

    def test_ecdsa_P256_SHA384_sign(self):
        d = 0xC9AFA9D845BA75166B5C215767B1D6934E50C3DB36E89B127B8A622B120F6721
        expected = (
            0x0EAFEA039B20E9B42309FB1D89E213057CBF973DC0CFC8F129EDDDC800EF7719,
            0x4861F0491E6998B9455193E34E7B0D284DDD7149A74B95B9261F13ABDE940954
        )
        sig = sign('sample', d, curve=P256, hashfunc=sha384)
        self.assertEqual(sig, expected)

        Q = d * P256.G
        self.assertTrue(verify(sig, 'sample', Q, curve=P256, hashfunc=sha384))

    """ case taken from http://tools.ietf.org/html/rfc6979#appendix-A.2.5 """

    def test_ecdsa_P256_SHA512_sign(self):
        d = 0xC9AFA9D845BA75166B5C215767B1D6934E50C3DB36E89B127B8A622B120F6721
        expected = (
            0x8496A60B5E9B47C825488827E0495B0E3FA109EC4568FD3F8D1097678EB97F00,
            0x2362AB1ADBE2B8ADF9CB9EDAB740EA6049C028114F2460F96554F61FAE3302FE
        )
        sig = sign('sample', d, curve=P256, hashfunc=sha512)
        self.assertEqual(sig, expected)

        Q = d * P256.G
        self.assertTrue(verify(sig, 'sample', Q, curve=P256, hashfunc=sha512))

    """ case taken from https://www.nsa.gov/ia/_files/ecdsa.pdf """

    def test_ecdsa_P256_verify(self):
        Q = Point(
            0x8101ece47464a6ead70cf69a6e2bd3d88691a3262d22cba4f7635eaff26680a8,
            0xd8a12ba61d599235f67d9cb4d58f1783d3ca43e78f0a5abaa624079936c0c3a9,
            curve=P256
        )
        msg = 'This is only a test message. It is 48 bytes long'
        sig = (
            0x7214bc9647160bbd39ff2f80533f5dc6ddd70ddf86bb815661e805d5d4e6f27c,
            0x7d1ff961980f961bdaa3233b6209f4013317d3e3f9e1493592dbeaa1af2bc367
        )
        self.assertTrue(verify(sig, msg, Q, curve=P256, hashfunc=sha256))

        sig = (
            0x7214bc9647160bbd39ff2f80533f5dc6ddd70ddf86bb815661e805d5d4e6fbad,
            0x7d1ff961980f961bdaa3233b6209f4013317d3e3f9e1493592dbeaa1af2bc367
        )
        self.assertFalse(verify(sig, msg, Q, curve=P256, hashfunc=sha256))