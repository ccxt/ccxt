from typing import Any, Dict, Optional, Sequence, Tuple

import cachetools

import starkware.storage.metrics as storage_metrics
from starkware.python.utils import safe_zip
from starkware.storage.storage import Storage


class DictStorage(Storage):
    """
    Local storage using dict.
    """

    def __init__(self, db=None):
        if db is None:
            db = {}
        self.db = db

    async def set_value(self, key: bytes, value: bytes):
        self.db[key] = value

    async def get_value(self, key: bytes) -> Optional[bytes]:
        return self.db.get(key, None)

    async def mset(self, updates: Dict[bytes, bytes]):
        self.db.update(updates)

    async def mget(self, keys: Sequence[bytes]) -> Tuple[Optional[bytes], ...]:
        return tuple(self.db.get(key, None) for key in keys)

    async def del_value(self, key: bytes):
        try:
            del self.db[key]
        except KeyError:
            pass


class CachedStorage(Storage):
    def __init__(self, storage: Storage, max_size: int, metric_active: Optional[bool] = None):
        self.storage = storage
        self.cache: cachetools.LRUCache[bytes, Any] = cachetools.LRUCache(maxsize=max_size)
        self.metric_active = False if metric_active is None else metric_active

    @classmethod
    async def create_from_config(
        cls, storage_config: Dict[str, Any], max_size: int, metric_active: bool
    ) -> "CachedStorage":
        return cls(
            storage=await Storage.create_instance_from_config(config=storage_config),
            max_size=max_size,
            metric_active=metric_active,
        )

    async def set_value(self, key: bytes, value: bytes):
        assert value is not None
        if self.cache.get(key, None) == value:
            return

        try:
            await self.storage.set_value(key, value)
        except:
            # Invalidate the entry to avoid conflicts between the cache and the storage.
            self.cache.pop(key, None)
            raise

        self.cache[key] = value

    async def setnx_value(self, key: bytes, value: bytes) -> bool:
        assert value is not None
        # Don't check the cache here to avoid race conditions.
        result = await self.storage.setnx_value(key=key, value=value)
        if result:
            self.cache[key] = value
        return result

    async def get_value(self, key: bytes) -> Optional[bytes]:
        if self.metric_active:
            storage_metrics.CACHED_STORAGE_GET_TOTAL.inc()
        if key in self.cache:
            if self.metric_active:
                storage_metrics.CACHED_STORAGE_GET_CACHE.inc()
            return self.cache[key]
        value = await self.storage.get_value(key)
        if value is None:
            return None
        self.cache[key] = value
        return value

    async def del_value(self, key: bytes):
        raise NotImplementedError("CachedStorage is expected to handle only immutable items")

    async def mset(self, updates: Dict[bytes, bytes]):
        assert all(value is not None for value in updates.values())
        new_updates = {
            key: value for key, value in updates.items() if self.cache.get(key, None) != value
        }
        try:
            await self.storage.mset(updates=new_updates)
        except:
            # mset failure might cause a partial write operation;
            # Invalidate the keys' cache to avoid conflicts between the cache and the storage.
            for key in new_updates.keys():
                self.cache.pop(key, None)
            raise

        self.cache.update(new_updates)

    async def mget(self, keys: Sequence[bytes]) -> Tuple[Optional[bytes], ...]:
        # Get cached values.
        values = [self.cache.get(key, None) for key in keys]
        missing_indices = [i for i, value in enumerate(values) if value is None]

        # Update metric.
        if self.metric_active:
            storage_metrics.CACHED_STORAGE_GET_TOTAL.inc(len(keys))
            storage_metrics.CACHED_STORAGE_GET_CACHE.inc(len(keys) - len(missing_indices))

        if len(missing_indices) == 0:
            return tuple(values)

        # Fetch missing values.
        missing_keys = [keys[i] for i in missing_indices]
        fetched_values = await self.storage.mget(keys=missing_keys)

        # Combine cached and fetched values.
        for i, fetched_value in safe_zip(missing_indices, fetched_values):
            values[i] = fetched_value

        # Update cache.
        self.cache.update(
            (
                (key, value)
                for key, value in safe_zip(missing_keys, fetched_values)
                if value is not None
            )
        )

        return tuple(values)
