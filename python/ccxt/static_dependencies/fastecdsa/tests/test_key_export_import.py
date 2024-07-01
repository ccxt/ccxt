from os import remove
from unittest import TestCase

from . import CURVES
from ..encoding.pem import PEMEncoder
from ..encoding.sec1 import SEC1Encoder
from ..keys import export_key, gen_keypair, import_key

TEST_FILE_PATH = 'fastecdsa_test_key.pem'


class TestExportImport(TestCase):
    def test_export_import_private_key(self):
        for curve in CURVES:
            d, Q = gen_keypair(curve)
            export_key(d, curve=curve, filepath=TEST_FILE_PATH)
            d_, Q_ = import_key(filepath=TEST_FILE_PATH, curve=curve)

            self.assertEqual(d, d_)
            self.assertEqual(Q, Q_)

            remove(TEST_FILE_PATH)

    def test_export_import_public_key(self):
        for curve in CURVES:
            for encoder in (PEMEncoder, SEC1Encoder):
                d, Q = gen_keypair(curve)
                export_key(Q, curve=curve, filepath=TEST_FILE_PATH, encoder=encoder)
                d_, Q_ = import_key(filepath=TEST_FILE_PATH, curve=curve, public=True, decoder=encoder)

                self.assertIsNone(d_)
                self.assertEqual(Q, Q_)

                remove(TEST_FILE_PATH)
