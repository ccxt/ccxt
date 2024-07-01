import dataclasses
from typing import ClassVar, Type, TypeVar

from starkware.cairo.lang.cairo_constants import DEFAULT_PRIME
from starkware.python.utils import from_bytes, to_bytes
from starkware.starkware_utils.commitment_tree.leaf_fact import LeafFact
from starkware.starkware_utils.commitment_tree.patricia_tree.nodes import EmptyNodeFact
from starkware.starkware_utils.validated_dataclass import ValidatedDataclass
from starkware.storage.storage import HASH_BYTES, HashFunctionType

TFeltLeaf = TypeVar("TFeltLeaf", bound="FeltLeaf")


@dataclasses.dataclass(frozen=True)
class FeltLeaf(LeafFact, ValidatedDataclass):
    """
    Represents a commitment tree leaf that holds a single field element.
    """

    value: int

    # Class variables.
    EMPTY_LEAF_VALUE: ClassVar[int] = 0

    assert (
        DEFAULT_PRIME.bit_length() < HASH_BYTES * 8
    ), f"Expecting a field element to fit in a {HASH_BYTES} bytes."

    @classmethod
    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)  # type: ignore[call-arg]

        # Derived classes must not (and need not) be marshmallow.
        assert cls.serialize is FeltLeaf.serialize, "Cannot override FeltLeaf de/serialize."

    def serialize(self) -> bytes:
        return to_bytes(self.value, length=HASH_BYTES)

    def _hash(self, hash_func: HashFunctionType) -> bytes:
        """
        Calculates and returns the leaf hash.
        Note that the return value size needs to be HASH_BYTES.
        """
        if self.is_empty:
            return EmptyNodeFact.EMPTY_NODE_HASH

        return self.serialize()

    @classmethod
    def deserialize(cls: Type[TFeltLeaf], data: bytes) -> TFeltLeaf:
        return cls(value=from_bytes(data))

    @classmethod
    def empty(cls: Type[TFeltLeaf]) -> "TFeltLeaf":
        return cls(value=cls.EMPTY_LEAF_VALUE)

    @property
    def is_empty(self) -> bool:
        return self.value == self.EMPTY_LEAF_VALUE
