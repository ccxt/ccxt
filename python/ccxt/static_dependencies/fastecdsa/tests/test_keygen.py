from unittest import TestCase

from ..keys import gen_private_key


class TestKeygen(TestCase):
    def test_gen_private_key(self):
        class FakeCurve():
            def __init__(self, q):
                self.q = q

        class FakeRandom():
            def __init__(self, values=b"\x00"):
                self.values = values
                self.pos = 0

            def __call__(self, nb):
                result = self.values[self.pos:self.pos + nb]
                self.pos += nb
                return result

        self.assertEqual(gen_private_key(FakeCurve(2), randfunc=FakeRandom(b"\x00")), 0)

        # 1 byte / 6 bits shaved off + the first try is lower than the order
        self.assertEqual(gen_private_key(FakeCurve(2), randfunc=FakeRandom(b"\x40")), 1)

        # 1 byte / 6 bits shaved off + the first try is higher than the order
        self.assertEqual(gen_private_key(FakeCurve(2), randfunc=FakeRandom(b"\xc0\x40")), 1)
        self.assertEqual(gen_private_key(FakeCurve(2), randfunc=FakeRandom(b"\xc0\x00")), 0)

        # 2 byte / 3 are shaved off, the first try is lower than the order.
        self.assertEqual(gen_private_key(FakeCurve(8191), randfunc=FakeRandom(b"\xff\xf0")), 8190)

        # 2 byte  / 3 are shaved off
        # first try : _bytes_to_int("\xff\xf8") >> 3 == 8191 (too high for order 8191)
        # second try : _bytes_to_int("\xff\xf0") >> 3 == 8190 (ok for order 8191)
        self.assertEqual(gen_private_key(FakeCurve(8191), randfunc=FakeRandom(b"\xff\xf8\xff\xf0")), 8190)

        # Same but with a different second try value
        self.assertEqual(gen_private_key(FakeCurve(8191), randfunc=FakeRandom(b"\xff\xf8\xff\xef")), 8189)