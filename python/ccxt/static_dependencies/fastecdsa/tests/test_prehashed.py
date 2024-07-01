
from hashlib import sha256
from unittest import TestCase

from ..curve import P256
from ..ecdsa import sign, verify
from ..keys import gen_keypair


class TestPrehashed(TestCase):
    def test_prehashed_bytes(self):
        d, Q = gen_keypair(P256)
        prehashed_message = sha256(b"").digest()

        r, s = sign(prehashed_message, d, prehashed=True)
        self.assertTrue(verify((r, s), prehashed_message, Q, prehashed=True))
