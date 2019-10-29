import unittest
from copy import deepcopy
from base.incremental_order_book import IncrementalOrderBook


class TestIncrementalOrderBook(unittest.TestCase):
    def setUp(self):
        self.standard = IncrementalOrderBook({
            'nonce': 123,
            'bids': [
                [2.4, 5],
                [1.5, 6],
                [1.4, 7],
            ],
            'asks': [
                [2.7, 5],
                [3.4, 6],
                [5.3, 7],
            ],
        })
        self.expected = deepcopy(self.standard.orderBook)

    def checkEquals(self):
        self.assertEqual(self.expected, self.standard.orderBook)

    def testSmallNonce(self):
        small_nonce = [100, 'add', 'bid', 3, 5]
        self.standard.update([small_nonce])
        self.checkEquals()

    def testDelete(self):
        delete = [124, 'delete', 'bids', 1.5, 0]
        self.standard.update([delete])
        self.expected['bids'] = [[2.4, 5], [1.4, 7]]
        self.checkEquals()

    def testAdd(self):
        add_bid = [124, 'add', 'bids', 2.2, 3]
        self.standard.update([add_bid])
        self.expected['bids'] = [
            [2.4, 5],
            [2.2, 3],
            [1.5, 6],
            [1.4, 7],
        ]
        self.checkEquals()

    def testAddAsk(self):
        add_bid = [124, 'add', 'asks', 3.1, 17]
        self.standard.update([add_bid])
        self.expected['asks'] = [
            [2.7, 5],
            [3.1, 17],
            [3.4, 6],
            [5.3, 7],
        ]
        self.checkEquals()
