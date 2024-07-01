import dataclasses

from starkware.python.utils import from_bytes, to_bytes
from starkware.starkware_utils.commitment_tree.leaf_fact import LeafFact
from starkware.storage.storage import HashFunctionType


@dataclasses.dataclass(frozen=True)
class SimpleLeafFact(LeafFact):
    value: int

    @classmethod
    def prefix(cls) -> bytes:
        return b"leaf"

    def serialize(self) -> bytes:
        return to_bytes(self.value)

    def _hash(self, hash_func: HashFunctionType) -> bytes:
        return self.serialize()

    @classmethod
    def deserialize(cls, data: bytes) -> "SimpleLeafFact":
        return cls(from_bytes(data))

    @classmethod
    def empty(cls) -> "SimpleLeafFact":
        return cls(value=0)

    @property
    def is_empty(self) -> bool:
        return self.value == 0
