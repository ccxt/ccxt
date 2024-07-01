from unittest import TestCase

from ..curve import W25519
from ..point import Point


class TestTypeValidation(TestCase):
    def test_type_validation_add(self):
        with self.assertRaises(TypeError):
            _ = Point.IDENTITY_ELEMENT + 2

        with self.assertRaises(TypeError):
            _ = W25519.G + 2

        with self.assertRaises(TypeError):
            _ = 2 + Point.IDENTITY_ELEMENT

        with self.assertRaises(TypeError):
            _ = 2 + W25519.G

    def test_type_validation_sub(self):
        with self.assertRaises(TypeError):
            _ = Point.IDENTITY_ELEMENT - 2

        with self.assertRaises(TypeError):
            _ = W25519.G - 2

        with self.assertRaises(TypeError):
            _ = 2 - Point.IDENTITY_ELEMENT

        with self.assertRaises(TypeError):
            _ = 2 - W25519.G

    def test_type_validation_mul(self):
        with self.assertRaises(TypeError):
            _ = Point.IDENTITY_ELEMENT * 1.5

        with self.assertRaises(TypeError):
            _ = W25519.G * 1.5

        with self.assertRaises(TypeError):
            _ = 1.5 * Point.IDENTITY_ELEMENT

        with self.assertRaises(TypeError):
            _ = 1.5 * W25519.G

    def test_point_at_infinity(self):
        self.assertEqual(W25519.G * 0, Point.IDENTITY_ELEMENT)
        self.assertEqual(W25519.G * W25519.q, Point.IDENTITY_ELEMENT)
        self.assertEqual(W25519.G + Point.IDENTITY_ELEMENT, W25519.G)
        self.assertEqual(W25519.G - Point.IDENTITY_ELEMENT, W25519.G)
