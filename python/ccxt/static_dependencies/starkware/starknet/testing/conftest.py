from typing import Iterator

import pytest

from starkware.eth.eth_test_utils import EthTestUtils


@pytest.fixture(scope="session")
def eth_test_utils() -> Iterator[EthTestUtils]:
    with EthTestUtils.context_manager() as val:
        yield val
