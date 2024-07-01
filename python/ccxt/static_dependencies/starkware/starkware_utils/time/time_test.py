from time import time as real_time

from starkware.starkware_utils.time.time import mock_time_func, time


def test_time():
    assert abs(real_time() - time()) < 1
    with mock_time_func(lambda: 1000):
        assert time() == 1000
        with mock_time_func(lambda: 2000):
            assert time() == 2000
        assert time() == 1000
