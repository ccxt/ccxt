import asyncio
from typing import Any, Dict

import pytest

from starkware.storage.dict_storage import CachedStorage, DictStorage
from starkware.storage.storage import IntToIntMapping, Storage
from starkware.storage.test_utils import DummyLockManager


@pytest.mark.asyncio
async def test_dummy_lock():
    lock_manager = DummyLockManager()

    locked = [False]

    async def try_lock1():
        async with await lock_manager.lock("lock1") as _:
            locked[0] = True

    async with await lock_manager.lock("lock0") as lock:
        await lock.extend()
        async with await lock_manager.lock("lock1") as lock:
            # Try to lock.
            t = asyncio.create_task(try_lock1())

            # Check that lock exists.
            assert await lock_manager.lock_exists("lock0")
            await asyncio.sleep(0.01)
            assert locked[0] is False
        await asyncio.sleep(0.01)
        assert locked[0] is True
        await t


@pytest.mark.asyncio
async def test_from_config():
    config: Dict[str, Any] = {"class": "starkware.storage.dict_storage.DictStorage", "config": {}}

    storage = await Storage.create_instance_from_config(config=config)
    assert type(storage) is DictStorage

    config["config"]["bad_param"] = None
    with pytest.raises(TypeError, match="got an unexpected keyword argument"):
        await Storage.create_instance_from_config(config=config)


def test_int_to_int_mapping_serializability():
    tested_object = IntToIntMapping(value=2021)
    serialized = tested_object.serialize()
    assert tested_object == IntToIntMapping.deserialize(data=serialized)


@pytest.mark.asyncio
async def test_cached_storage():
    storage = DictStorage()
    cached_storage = CachedStorage(storage=storage, max_size=1000)

    # Setup the storage.
    storage.db = {b"1": b"1", b"2": b"2"}

    # Write some values through the cached storage.
    await cached_storage.mset(updates={b"1": b"A", b"3": b"3"})

    # Test mget - change the DB manually to verify that the cached storage does not access it
    # for cached value.
    storage.db[b"3"] = b"C"
    assert await cached_storage.mget(keys=[b"1", b"2", b"4", b"3"]) == (b"A", b"2", None, b"3")

    # Check cache.
    assert cached_storage.cache == {b"1": b"A", b"2": b"2", b"3": b"3"}

    # Test `mget_or_fail`.
    with pytest.raises(AssertionError, match="Key b'4' does not exist in storage."):
        assert await cached_storage.mget_or_fail(keys=[b"1", b"2", b"4", b"3"])

    assert await cached_storage.mget_or_fail(keys=[b"3", b"1", b"2"]) == (b"3", b"A", b"2")
