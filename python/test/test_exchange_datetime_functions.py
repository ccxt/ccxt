from unittest import TestCase

import os
import sys

# ------------------------------------------------------------------------------

root = os.path.dirname(os.path.abspath(__file__))
sys.path.append(root)

# ------------------------------------------------------------------------------

import ccxt

# ------------------------------------------------------------------------------

exchange = ccxt.Exchange()

class TestExchange(TestCase):
    def test_iso8601(self):
        self.assertEqual(exchange.iso8601(714862627000), '1992-08-26T20:57:07.000Z')
        self.assertEqual(exchange.iso8601(0), '1970-01-01T00:00:00.000Z')

        self.assertEqual(exchange.iso8601(None), None)
        self.assertEqual(exchange.iso8601(), None)
        self.assertEqual(exchange.iso8601(-1), None)
        self.assertEqual(exchange.iso8601({}), None)
        self.assertEqual(exchange.iso8601(''), None)
        self.assertEqual(exchange.iso8601('a'), None)
        self.assertEqual(exchange.iso8601([]), None)
        self.assertEqual(exchange.iso8601([1]), None)
