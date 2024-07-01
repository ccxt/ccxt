import asyncio
import logging
from contextlib import asynccontextmanager
from typing import Dict, List, Optional

from starkware.storage.storage import Storage

logger = logging.getLogger(__name__)


class _ImmediateStorage(Storage):
    def __init__(self, storage: Storage, avoid_write_through: bool):
        self.storage = storage
        self.write_tasks: List[asyncio.Task] = []
        self.db: Dict[bytes, bytes] = {}
        self.avoid_write_through = avoid_write_through

    async def set_value(self, key: bytes, value: bytes):
        assert isinstance(key, bytes), f"key must be bytes. Got {type(key)}."
        self.db[key] = value

        if not self.avoid_write_through:
            self.write_tasks.append(asyncio.create_task(self.storage.set_value(key, value)))

    async def get_value(self, key: bytes) -> Optional[bytes]:
        assert isinstance(key, bytes), f"key must be bytes. Got {type(key)}."
        if key in self.db:
            return self.db[key]
        res = await self.storage.get_value(key)
        if res is not None:
            self.db[key] = res
        return res

    async def del_value(self, key: bytes):
        assert isinstance(key, bytes), f"key must be bytes. Got {type(key)}."
        if key in self.db:
            del self.db[key]

        if not self.avoid_write_through:
            self.write_tasks.append(asyncio.create_task(self.storage.del_value(key)))

    async def wait_for_all(self):
        n_write_tasks = len(self.write_tasks)
        if n_write_tasks == 0:
            return

        logger.debug(f"Performing {n_write_tasks} writing tasks to storage...")

        logging_chunk_size = 2**8
        for n_handled_tasks, task in enumerate(self.write_tasks):
            if n_handled_tasks % logging_chunk_size == 0:
                logger.debug(f"{len(self.write_tasks) - n_handled_tasks} writing tasks left.")

            await task

        # Clean list in order to prevent a memory leak, due to cyclic object reference.
        self.write_tasks = []


class LocalStorage(_ImmediateStorage):
    """
    A storage class with local cache. Write requests are not flushed to the actual storage, read
    requests for keys not in cache are read from the actual storage.
    """

    def __init__(self, storage: Storage):
        super().__init__(storage=storage, avoid_write_through=True)


@asynccontextmanager
async def immediate_storage(storage: Storage, avoid_write_through: bool = False):
    try:
        res = _ImmediateStorage(storage=storage, avoid_write_through=avoid_write_through)
        yield res
    finally:
        await res.wait_for_all()
