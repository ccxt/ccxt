from hashlib import sha256
from unittest import TestCase

from . import CURVES
from ..ecdsa import sign
from ..keys import gen_keypair, get_public_keys_from_sig


class TestKeyRecovery(TestCase):
    def test_key_recovery(self):
        for curve in CURVES:
            d, Q = gen_keypair(curve)
            msg = 'https://crypto.stackexchange.com/questions/18105/how-does-recovering-the-' \
                  'public-key-from-an-ecdsa-signature-work'
            sig = sign(msg, d, curve=curve)

            Qs = get_public_keys_from_sig(sig, msg, curve=curve, hashfunc=sha256)
            self.assertTrue(Q in Qs)