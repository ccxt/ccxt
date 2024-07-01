import hashlib
from typing import Any, Dict, Optional, Tuple

from starkware.storage.names import generate_unique_key
from starkware.storage.storage import Storage

MAGIC_HEADER = hashlib.sha256(b"Gated storage magic header").digest()
RECORD_LENGTH_BUFFER = 10240


class GatedStorage(Storage):
    """
    Storage that normally saves small objects in primary storage, and large objects in secondary.
    """

    def __init__(self, limit: int, storage0: Storage, storage1: Storage):
        self.limit = limit
        self.storage0 = storage0
        self.storage1 = storage1

    @classmethod
    async def create_from_config(
        cls, limit: int, storage0_config: Dict[str, Any], storage1_config: Dict[str, Any]
    ) -> "GatedStorage":
        return cls(
            limit=limit,
            storage0=await Storage.create_instance_from_config(config=storage0_config),
            storage1=await Storage.create_instance_from_config(config=storage1_config),
        )

    async def _compress_value(self, key: bytes, value: bytes) -> Tuple[bytes, bytes]:
        """
        In case that the length of the key + the length of the value is greater than the limit,
        stores the value in the second storage, with a unique key and returns the new value that
        will be stored to the first storage which indicates that the original value is stored in
        storage1.
        """
        if value[: len(MAGIC_HEADER)] != MAGIC_HEADER:
            # If the value starts with MAGIC_HEADER, treat the value as a large value; Hence, it
            # will be stored in the second storage.

            # RECORD_LENGTH_BUFFER is added to the calculation in order to avoid edge cases where
            # record metadata causes it to exceed the maximum allowed length.
            if len(key) + len(value) + RECORD_LENGTH_BUFFER <= self.limit:
                return key, value

        ukey = generate_unique_key(
            item_type="gated",
            props={"orig_key": key.hex()},
        )
        await self.storage1.set_value(key=ukey, value=value)
        new_value = MAGIC_HEADER + ukey
        return key, new_value

    async def set_value(self, key: bytes, value: bytes):
        await self.storage0.set_value(*await self._compress_value(key=key, value=value))

    async def setnx_value(self, key: bytes, value: bytes) -> bool:
        return await self.storage0.setnx_value(*await self._compress_value(key=key, value=value))

    async def get_value(self, key: bytes) -> Optional[bytes]:
        value = await self.storage0.get_value(key=key)
        if value is None:
            return None
        if (value[: len(MAGIC_HEADER)]) == MAGIC_HEADER:
            ukey = value[len(MAGIC_HEADER) :]
            return await self.storage1.get_value_or_fail(key=ukey)

        return value

    async def get_value_or_fail(self, key: bytes) -> bytes:
        value = await self.storage0.get_value_or_fail(key=key)
        if (value[: len(MAGIC_HEADER)]) == MAGIC_HEADER:
            ukey = value[len(MAGIC_HEADER) :]
            return await self.storage1.get_value_or_fail(key=ukey)
        return value

    async def has_key(self, key: bytes) -> bool:
        return await self.storage0.has_key(key=key)

    async def del_value(self, key: bytes):
        """
        Deletes the key from storage0 and the ukey which corresponds to key in storage1 (if exists).
        """
        value = await self.storage0.get_value(key=key)
        if value is None:
            return
        if (value[: len(MAGIC_HEADER)]) == MAGIC_HEADER:
            ukey = value[len(MAGIC_HEADER) :]
            await self.storage1.del_value(key=ukey)

        await self.storage0.del_value(key=key)
