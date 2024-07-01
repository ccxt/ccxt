from binascii import unhexlify
from hashlib import sha224, sha256, sha384, sha3_224, sha3_256, sha3_384, sha3_512, sha512
from json import load
from unittest import TestCase, skipIf

from fastecdsa.curve import (
    P224, P256, P384, P521,
    brainpoolP224r1, brainpoolP256r1, brainpoolP320r1, brainpoolP384r1, brainpoolP512r1,
    secp256k1
)
from fastecdsa.ecdsa import verify
from fastecdsa.encoding.der import DEREncoder
from fastecdsa.encoding.sec1 import SEC1Encoder


class TestWycheproofEcdsaVerify(TestCase):
    @staticmethod
    def _get_tests(filename):
        with open(filename) as f:
            test_json = load(f)
        
        return test_json["testGroups"]

    def _test_runner(self, tests, curve, hashfunc):
        for test_group in tests:
            keybytes = unhexlify(test_group["key"]["uncompressed"])
            public_key = SEC1Encoder.decode_public_key(keybytes, curve)

            for test in test_group["tests"]:
                try:
                    message = unhexlify(test["msg"])
                    sigbytes = unhexlify(test["sig"])
                    signature = DEREncoder.decode_signature(sigbytes)
                    expected = test["result"] == "valid"

                    result = verify(signature, message, public_key, curve, hashfunc)
                    self.assertEqual(result, expected, test)
                except:
                    self.assertFalse(test["result"] == "valid", test)

    def test_brainpool224r1_sha224(self):
        filename = "fastecdsa/tests/vectors/whycheproof/ecdsa_brainpoolP224r1_sha224_test.json"
        tests = self._get_tests(filename)
        self._test_runner(tests, brainpoolP224r1, sha224)

    def test_brainpoolP256r1_sha256(self):
        filename = "fastecdsa/tests/vectors/whycheproof/ecdsa_brainpoolP256r1_sha256_test.json"
        tests = self._get_tests(filename)
        self._test_runner(tests, brainpoolP256r1, sha256)

    def test_brainpoolP320r1_sha384(self):
        filename = "fastecdsa/tests/vectors/whycheproof/ecdsa_brainpoolP320r1_sha384_test.json"
        tests = self._get_tests(filename)
        self._test_runner(tests, brainpoolP320r1, sha384)

    def test_brainpoolP384r1_sha384(self):
        filename = "fastecdsa/tests/vectors/whycheproof/ecdsa_brainpoolP384r1_sha384_test.json"
        tests = self._get_tests(filename)
        self._test_runner(tests, brainpoolP384r1, sha384)

    def test_brainpoolP512r1_sha512(self):
        filename = "fastecdsa/tests/vectors/whycheproof/ecdsa_brainpoolP512r1_sha512_test.json"
        tests = self._get_tests(filename)
        self._test_runner(tests, brainpoolP512r1, sha512)

    def test_p224_sha224(self):
        filename = "fastecdsa/tests/vectors/whycheproof/ecdsa_secp224r1_sha224_test.json"
        tests = self._get_tests(filename)
        self._test_runner(tests, P224, sha224)

    def test_p224_sha256(self):
        filename = "fastecdsa/tests/vectors/whycheproof/ecdsa_secp224r1_sha256_test.json"
        tests = self._get_tests(filename)
        self._test_runner(tests, P224, sha256)

    def test_p224_sha3_224(self):
        filename = "fastecdsa/tests/vectors/whycheproof/ecdsa_secp224r1_sha3_224_test.json"
        tests = self._get_tests(filename)
        self._test_runner(tests, P224, sha3_224)

    def test_p224_sha3_256(self):
        filename = "fastecdsa/tests/vectors/whycheproof/ecdsa_secp224r1_sha3_256_test.json"
        tests = self._get_tests(filename)
        self._test_runner(tests, P224, sha3_256)

    def test_p224_sha3_512(self):
        filename = "fastecdsa/tests/vectors/whycheproof/ecdsa_secp224r1_sha3_512_test.json"
        tests = self._get_tests(filename)
        self._test_runner(tests, P224, sha3_512)

    def test_p224_sha512(self):
        filename = "fastecdsa/tests/vectors/whycheproof/ecdsa_secp224r1_sha512_test.json"
        tests = self._get_tests(filename)
        self._test_runner(tests, P224, sha512)

    def test_secp256k1_sha256(self):
        filename = "fastecdsa/tests/vectors/whycheproof/ecdsa_secp256k1_sha256_test.json"
        tests = self._get_tests(filename)
        self._test_runner(tests, secp256k1, sha256)

    def test_secp256k1_sha3_256(self):
        filename = "fastecdsa/tests/vectors/whycheproof/ecdsa_secp256k1_sha3_256_test.json"
        tests = self._get_tests(filename)
        self._test_runner(tests, secp256k1, sha3_256)

    def test_secp256k1_sha3_512(self):
        filename = "fastecdsa/tests/vectors/whycheproof/ecdsa_secp256k1_sha3_512_test.json"
        tests = self._get_tests(filename)
        self._test_runner(tests, secp256k1, sha3_512)

    def test_secp256k1_sha512(self):
        filename = "fastecdsa/tests/vectors/whycheproof/ecdsa_secp256k1_sha512_test.json"
        tests = self._get_tests(filename)
        self._test_runner(tests, secp256k1, sha512)

    def test_p256_sha256(self):
        filename = "fastecdsa/tests/vectors/whycheproof/ecdsa_secp256r1_sha256_test.json"
        tests = self._get_tests(filename)
        self._test_runner(tests, P256, sha256)

    def test_p256_sha3_256(self):
        filename = "fastecdsa/tests/vectors/whycheproof/ecdsa_secp256r1_sha3_256_test.json"
        tests = self._get_tests(filename)
        self._test_runner(tests, P256, sha3_256)

    def test_p256_sha3_512(self):
        filename = "fastecdsa/tests/vectors/whycheproof/ecdsa_secp256r1_sha3_512_test.json"
        tests = self._get_tests(filename)
        self._test_runner(tests, P256, sha3_512)

    def test_p256_sha512(self):
        filename = "fastecdsa/tests/vectors/whycheproof/ecdsa_secp256r1_sha512_test.json"
        tests = self._get_tests(filename)
        self._test_runner(tests, P256, sha512)

    def test_p384_sha384(self):
        filename = "fastecdsa/tests/vectors/whycheproof/ecdsa_secp384r1_sha384_test.json"
        tests = self._get_tests(filename)
        self._test_runner(tests, P384, sha384)

    def test_p384_sha3_384(self):
        filename = "fastecdsa/tests/vectors/whycheproof/ecdsa_secp384r1_sha3_384_test.json"
        tests = self._get_tests(filename)
        self._test_runner(tests, P384, sha3_384)

    def test_p384_sha3_512(self):
        filename = "fastecdsa/tests/vectors/whycheproof/ecdsa_secp384r1_sha3_512_test.json"
        tests = self._get_tests(filename)
        self._test_runner(tests, P384, sha3_512)

    def test_p384_sha512(self):
        filename = "fastecdsa/tests/vectors/whycheproof/ecdsa_secp384r1_sha512_test.json"
        tests = self._get_tests(filename)
        self._test_runner(tests, P384, sha512)

    def test_p521_sha3_512(self):
        filename = "fastecdsa/tests/vectors/whycheproof/ecdsa_secp521r1_sha3_512_test.json"
        tests = self._get_tests(filename)
        self._test_runner(tests, P521, sha3_512)

    def test_p521_sha512(self):
        filename = "fastecdsa/tests/vectors/whycheproof/ecdsa_secp521r1_sha512_test.json"
        tests = self._get_tests(filename)
        self._test_runner(tests, P521, sha512)
