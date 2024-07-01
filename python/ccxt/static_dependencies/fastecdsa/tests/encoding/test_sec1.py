from binascii import hexlify, unhexlify
from unittest import TestCase

from fastecdsa.curve import P256, secp192k1, secp256k1
from fastecdsa.encoding.sec1 import InvalidSEC1PublicKey, SEC1Encoder
from fastecdsa.point import Point


class TestSEC1Encoder(TestCase):
    def test_encode_public_key(self):
        # 1/ PrivateKey generated using openssl "openssl ecparam -name secp256k1 -genkey -out ec-priv.pem"
        # 2/ Printed using "openssl ec -in ec-priv.pem -text -noout" and converted to numeric using "asn1._bytes_to_int"
        priv_key = 7002880736699640265110069622773736733141182416793484574964618597954446769264
        pubkey_compressed = hexlify(SEC1Encoder.encode_public_key(secp256k1.G * priv_key))
        pubkey_uncompressed = hexlify(SEC1Encoder.encode_public_key(secp256k1.G * priv_key, compressed=False))

        # 3/ PublicKey extracted using "openssl ec -in ec-priv.pem -pubout -out ec-pub.pem"
        # 4/ Encoding verified using openssl "openssl ec -in ec-pub.pem -pubin -text -noout -conv_form compressed"
        self.assertEqual(pubkey_compressed, b"02e5e2c01985aafb6e2c3ad49f3db5ccc54b2e63343af405b521303d0f35835062")
        self.assertEqual(
            pubkey_uncompressed,
            b"04e5e2c01985aafb6e2c3ad49f3db5ccc54b2e63343af405b521303d0f3583506"
            b"23dad76df888abde5ed0cc5af1b83968edffcae5d70bedb24fdc18bb5f79499d0",
        )

        # Same with P256 Curve
        priv_P256 = 807015861248675637760562792774171551137308512372870683367415858378856470633
        pubkey_compressed = hexlify(SEC1Encoder.encode_public_key(P256.G * priv_P256))
        pubkey_uncompressed = hexlify(SEC1Encoder.encode_public_key(P256.G * priv_P256, compressed=False))
        self.assertEqual(pubkey_compressed, b"0212c9ddf64b0d1f1d91d9bd729abfb880079fa889d66604cc0b78c9cbc271824c")
        self.assertEqual(
            pubkey_uncompressed,
            b"0412c9ddf64b0d1f1d91d9bd729abfb880079fa889d66604cc0b78c9cbc271824"
            b"c9a7d581bcf2aba680b53cedbade03be62fe95869da04a168a458f369ac6a823e",
        )

        # And secp192k1 Curve
        priv_secp192k1 = 5345863567856687638748079156318679969014620278806295592453
        pubkey_compressed = hexlify(SEC1Encoder.encode_public_key(secp192k1.G * priv_secp192k1))
        pubkey_uncompressed = hexlify(SEC1Encoder.encode_public_key(secp192k1.G * priv_secp192k1, compressed=False))
        self.assertEqual(pubkey_compressed, b"03a3bec5fba6d13e51fb55bd88dd097cb9b04f827bc151d22d")
        self.assertEqual(
            pubkey_uncompressed,
            b"04a3bec5fba6d13e51fb55bd88dd097cb9b04f827bc151d22df07a73819149e8d903aa983e52ab1cff38f0d381f940d361",
        )

    def test_decode_public_key(self):
        expected_public = Point(
            x=0xE5E2C01985AAFB6E2C3AD49F3DB5CCC54B2E63343AF405B521303D0F35835062,
            y=0x3DAD76DF888ABDE5ED0CC5AF1B83968EDFFCAE5D70BEDB24FDC18BB5F79499D0,
            curve=secp256k1,
        )
        public_from_compressed = SEC1Encoder.decode_public_key(
            unhexlify(b"02e5e2c01985aafb6e2c3ad49f3db5ccc54b2e63343af405b521303d0f35835062"), secp256k1
        )
        public_from_uncompressed = SEC1Encoder.decode_public_key(
            unhexlify(
                b"04e5e2c01985aafb6e2c3ad49f3db5ccc54b2e63343af405b521303d0f3583506"
                b"23dad76df888abde5ed0cc5af1b83968edffcae5d70bedb24fdc18bb5f79499d0"
            ),
            secp256k1,
        )

        # Same values as in `test_encode_public_key`, verified using openssl
        self.assertEqual(public_from_compressed, expected_public)
        self.assertEqual(public_from_uncompressed, expected_public)
        with self.assertRaises(InvalidSEC1PublicKey) as e:
            SEC1Encoder.decode_public_key(b"\x02", secp256k1)  # invalid compressed length
        self.assertEqual(e.exception.args[0], "A compressed public key must be 33 bytes long")
        with self.assertRaises(InvalidSEC1PublicKey) as e:
            SEC1Encoder.decode_public_key(b"\x04", secp256k1)  # invalid uncompressed length
        self.assertEqual(e.exception.args[0], "An uncompressed public key must be 65 bytes long")
        with self.assertRaises(InvalidSEC1PublicKey) as e:
            # invalid prefix value
            SEC1Encoder.decode_public_key(
                unhexlify(b"05e5e2c01985aafb6e2c3ad49f3db5ccc54b2e63343af405b521303d0f35835062"), secp256k1
            )
        self.assertEqual(e.exception.args[0], "Wrong key format")

        # With P256, same values as in `test_encode_public_key`, verified using openssl
        expected_P256 = Point(
            x=0x12C9DDF64B0D1F1D91D9BD729ABFB880079FA889D66604CC0B78C9CBC271824C,
            y=0x9A7D581BCF2ABA680B53CEDBADE03BE62FE95869DA04A168A458F369AC6A823E,
            curve=P256,
        )
        public_from_compressed = SEC1Encoder.decode_public_key(
            unhexlify(b"0212c9ddf64b0d1f1d91d9bd729abfb880079fa889d66604cc0b78c9cbc271824c"), P256
        )
        self.assertEqual(public_from_compressed, expected_P256)

        # With secp192k1, same values as in `test_encode_public_key`, verified using openssl
        expected_secp192k1 = Point(
            x=0xA3BEC5FBA6D13E51FB55BD88DD097CB9B04F827BC151D22D,
            y=0xF07A73819149E8D903AA983E52AB1CFF38F0D381F940D361,
            curve=secp192k1,
        )
        public_from_compressed = SEC1Encoder.decode_public_key(
            unhexlify(b"03a3bec5fba6d13e51fb55bd88dd097cb9b04f827bc151d22d"), secp192k1
        )
        self.assertEqual(public_from_compressed, expected_secp192k1)
