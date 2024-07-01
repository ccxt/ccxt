import pytest

from starkware.storage.gated_storage import MAGIC_HEADER, RECORD_LENGTH_BUFFER, GatedStorage
from starkware.storage.test_utils import MockStorage


@pytest.mark.asyncio
async def test_gated_storage():
    storage0 = MockStorage()
    storage1 = MockStorage()
    storage = GatedStorage(limit=10 + RECORD_LENGTH_BUFFER, storage0=storage0, storage1=storage1)

    keys_values = [(b"k0", b"v0"), (b"k1", b"v1" * 6)]
    for k, v in keys_values:
        assert await storage.get_value(key=k) is None
        assert not await storage.has_key(key=k)
        await storage.set_value(key=k, value=v)
        assert await storage.get_value_or_fail(key=k) == v
        assert await storage.has_key(key=k)
        assert not await storage.setnx_value(key=k, value=b"wrong")
        assert await storage.get_value_or_fail(key=k) == v

    assert storage0.db.keys() == {b"k0", b"k1"}
    assert len(storage1.db.keys()) == 1

    for k, _ in keys_values:
        await storage.del_value(k)

    assert len(storage0.db.keys()) == 0
    assert len(storage1.db.keys()) == 0


@pytest.mark.asyncio
async def test_magic_header_gated_storage():
    """
    Tests the edge case where the prefix of a short value is MAGIC_HEADER. In this case, the value
    will be stored in the secondary storage.
    """
    storage0 = MockStorage()
    storage1 = MockStorage()
    storage = GatedStorage(limit=1000, storage0=storage0, storage1=storage1)
    key, value = (b"k0", MAGIC_HEADER + b"v0")
    await storage.set_value(key=key, value=value)
    assert await storage.get_value_or_fail(key=key) == value
    assert storage0.db.keys() == {b"k0"}
    assert len(storage1.db.keys()) == 1
    await storage.del_value(key=key)
    assert len(storage0.db.keys()) == 0
    assert len(storage1.db.keys()) == 0
