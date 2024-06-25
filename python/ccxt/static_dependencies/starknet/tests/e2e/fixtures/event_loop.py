# This fixture was added to enable using async fixtures
import asyncio

import pytest


@pytest.fixture(scope="package")
def event_loop():
    policy = asyncio.get_event_loop_policy()
    loop = policy.new_event_loop()
    yield loop
    loop.close()
