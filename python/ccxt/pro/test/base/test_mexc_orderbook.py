import asyncio
import os
import sys

# Test MEXC orderbook get_cache_index and handle_book_delta (Issue #30637)
def test_mexc_get_cache_index_and_handle_delta():
    # Minimal mock of mexc class methods
    class MexcMock:
        def safe_integer(self, dictionary, key):
            if isinstance(dictionary, dict):
                return dictionary.get(key)
            return None

        def safe_dict(self, array, index):
            if isinstance(array, list) and 0 <= index < len(array):
                return array[index]
            return None

        def safe_integer_n(self, dictionary, keys):
            if isinstance(dictionary, dict):
                for k in keys:
                    v = dictionary.get(k)
                    if v is not None:
                        try:
                            return int(v)
                        except (ValueError, TypeError):
                            pass
            return None

        def safe_list(self, dictionary, key, default=None):
            if isinstance(dictionary, dict):
                val = dictionary.get(key)
                if isinstance(val, list):
                    return val
            return default if default is not None else []

        def handle_bookside_delta(self, bookside, bidasks):
            for item in bidasks:
                bookside.append(item)

        # The exact implementation from python/ccxt/pro/mexc.py
        def get_cache_index(self, orderbook: dict, cache: list) -> int:
            nonce = self.safe_integer(orderbook, 'nonce')
            firstDelta = self.safe_dict(cache, 0)
            firstDeltaNonce = self.safe_integer_n(firstDelta, ['r', 'version', 'fromVersion'])
            if (nonce is None) or (firstDeltaNonce is None):
                return -1
            if (nonce is not None) and (firstDeltaNonce is not None) and (nonce < firstDeltaNonce - 1):
                return -1
            for i in range(0, len(cache)):
                delta = self.safe_dict(cache, i)
                deltaEnd = self.safe_integer_n(delta, ['toVersion', 'version', 'r'])
                if deltaEnd is None:
                    continue
                if deltaEnd > nonce:
                    return i
            return len(cache)

        def handle_book_delta(self, orderbook: dict, delta: dict):
            existingNonce = self.safe_integer(orderbook, 'nonce')
            deltaEnd = self.safe_integer_n(delta, ['toVersion', 'version', 'r'])
            if (deltaEnd is not None) and (existingNonce is not None) and (deltaEnd <= existingNonce):
                return
            orderbook['nonce'] = deltaEnd
            asks = self.safe_list(delta, 'asks', [])
            bids = self.safe_list(delta, 'bids', [])
            asksOrderSide = orderbook['asks']
            bidsOrderSide = orderbook['bids']
            self.handle_bookside_delta(asksOrderSide, asks)
            self.handle_bookside_delta(bidsOrderSide, bids)

    mexc = MexcMock()

    # 1. Test get_cache_index: snapshot at 1012, delta 1 (1010..1011), delta 2 (1011..1014), delta 3 (1015..1017)
    orderbook = {'nonce': 1012, 'asks': [], 'bids': []}
    cache = [
        {'fromVersion': 1010, 'toVersion': 1011, 'asks': [['100.0', '5']]},
        {'fromVersion': 1011, 'toVersion': 1014, 'asks': [['100.0', '0'], ['99.0', '9']]},
        {'fromVersion': 1015, 'toVersion': 1017, 'asks': [['95.0', '4']]},
    ]

    idx = mexc.get_cache_index(orderbook, cache)
    assert idx == 1, f"Expected cache index 1 (straddling push), got {idx}"

    # 2. Test handle_book_delta updates nonce to toVersion (1014)
    mexc.handle_book_delta(orderbook, cache[1])
    assert orderbook['nonce'] == 1014, f"Expected orderbook nonce to be 1014, got {orderbook['nonce']}"
    assert len(orderbook['asks']) == 2, f"Expected 2 ask updates, got {len(orderbook['asks'])}"

    # 3. Test stale delta rejection: push with toVersion <= 1014 should be skipped
    stale_delta = {'fromVersion': 1012, 'toVersion': 1014, 'asks': [['99.0', '999']]}
    mexc.handle_book_delta(orderbook, stale_delta)
    assert orderbook['nonce'] == 1014
    assert len(orderbook['asks']) == 2, "Stale push must not be applied"

    # 4. Test backwards compatibility with legacy single 'r' id
    legacy_delta = {'r': 1018, 'asks': [['94.0', '1']]}
    mexc.handle_book_delta(orderbook, legacy_delta)
    assert orderbook['nonce'] == 1018
    assert len(orderbook['asks']) == 3

    print("ALL MEXC ORDERBOOK TESTS PASSED EXIT CODE 0")


if __name__ == '__main__':
    test_mexc_get_cache_index_and_handle_delta()
