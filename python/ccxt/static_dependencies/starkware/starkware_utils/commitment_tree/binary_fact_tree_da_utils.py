import dataclasses
from dataclasses import field
from typing import Type, TypeVar

from starkware.python.utils import from_bytes
from starkware.starkware_utils.commitment_tree.binary_fact_tree import BinaryFactTree
from starkware.starkware_utils.marshmallow_fields_metadata import int_as_hex_metadata
from starkware.starkware_utils.validated_dataclass import ValidatedDataclass

TBinaryFactTreeDiff = TypeVar("TBinaryFactTreeDiff", bound="BinaryFactTreeDiffBase")


@dataclasses.dataclass(frozen=True)
class BinaryFactTreeDiffBase(ValidatedDataclass):
    initial_root: int = field(metadata=int_as_hex_metadata(validated_field=None))
    final_root: int = field(metadata=int_as_hex_metadata(validated_field=None))

    @classmethod
    def from_trees(
        cls: Type[TBinaryFactTreeDiff], initial_tree: BinaryFactTree, final_tree: BinaryFactTree
    ) -> TBinaryFactTreeDiff:
        raise NotImplementedError


@dataclasses.dataclass(frozen=True)
class BinaryFactTreeDiffVersion1(BinaryFactTreeDiffBase):
    height: int

    @classmethod
    def from_trees(
        cls: Type["BinaryFactTreeDiffVersion1"],
        initial_tree: BinaryFactTree,
        final_tree: BinaryFactTree,
    ) -> "BinaryFactTreeDiffVersion1":
        return cls(
            initial_root=from_bytes(initial_tree.root),
            final_root=from_bytes(final_tree.root),
            height=final_tree.height,
        )


@dataclasses.dataclass(frozen=True)
class BinaryFactTreeDiffVersion2(BinaryFactTreeDiffBase):
    @classmethod
    def from_trees(
        cls: Type["BinaryFactTreeDiffVersion2"],
        initial_tree: BinaryFactTree,
        final_tree: BinaryFactTree,
    ) -> "BinaryFactTreeDiffVersion2":
        return cls(
            initial_root=from_bytes(initial_tree.root), final_root=from_bytes(final_tree.root)
        )

    @classmethod
    def from_v1(cls, tree_diff_v1: BinaryFactTreeDiffVersion1) -> "BinaryFactTreeDiffVersion2":
        return BinaryFactTreeDiffVersion2(
            initial_root=tree_diff_v1.initial_root, final_root=tree_diff_v1.final_root
        )

    def to_v1(self, height: int) -> BinaryFactTreeDiffVersion1:
        return BinaryFactTreeDiffVersion1(
            initial_root=self.initial_root, final_root=self.final_root, height=height
        )


BinaryFactTreeDiff = BinaryFactTreeDiffVersion2
