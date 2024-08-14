# File is copied from
# https://github.com/starkware-libs/cairo-lang/blob/v0.13.1/src/starkware/starknet/core/os/contract_class/compiled_class_hash_objects.py

import dataclasses
import itertools
from abc import ABC, abstractmethod
from typing import Any, List, Union

from poseidon_py.poseidon_hash import poseidon_hash_many


class BytecodeSegmentStructure(ABC):
    """
    Represents the structure of the bytecode to allow loading it partially into the OS memory.
    See the documentation of the OS function `bytecode_hash_node` in `compiled_class.cairo`
    for more details.
    """

    @abstractmethod
    def hash(self) -> int:
        """
        Computes the hash of the node.
        """

    def bytecode_with_skipped_segments(self):
        """
        Returns the bytecode of the node.
        Skipped segments are replaced with [-1, -2, -2, -2, ...].
        """
        res: List[int] = []
        self.add_bytecode_with_skipped_segments(res)
        return res

    @abstractmethod
    def add_bytecode_with_skipped_segments(self, data: List[int]):
        """
        Same as bytecode_with_skipped_segments, but appends the result to the given list.
        """


@dataclasses.dataclass
class BytecodeLeaf(BytecodeSegmentStructure):
    """
    Represents a leaf in the bytecode segment tree.
    """

    data: List[int]

    def hash(self) -> int:
        return poseidon_hash_many(self.data)

    def add_bytecode_with_skipped_segments(self, data: List[int]):
        data.extend(self.data)


@dataclasses.dataclass
class BytecodeSegmentedNode(BytecodeSegmentStructure):
    """
    Represents an internal node in the bytecode segment tree.
    Each child can be loaded into memory or skipped.
    """

    segments: List["BytecodeSegment"]

    def hash(self) -> int:
        return (
            poseidon_hash_many(
                itertools.chain(  # pyright: ignore
                    *[
                        (node.segment_length, node.inner_structure.hash())
                        for node in self.segments
                    ]
                )
            )
            + 1
        )

    def add_bytecode_with_skipped_segments(self, data: List[int]):
        for segment in self.segments:
            if segment.is_used:
                segment.inner_structure.add_bytecode_with_skipped_segments(data)
            else:
                data.append(-1)
                data.extend(-2 for _ in range(segment.segment_length - 1))


@dataclasses.dataclass
class BytecodeSegment:
    """
    Represents a child of BytecodeSegmentedNode.
    """

    # The length of the segment.
    segment_length: int
    # Should the segment (or part of it) be loaded to memory.
    # In other words, is the segment used during the execution.
    # Note that if is_used is False, the entire segment is not loaded to memory.
    # If is_used is True, it is possible that part of the segment will be skipped (according
    # to the "is_used" field of the child segments).
    is_used: bool
    # The inner structure of the segment.
    inner_structure: BytecodeSegmentStructure

    def __post_init__(self):
        assert (
            self.segment_length > 0
        ), f"Invalid segment length: {self.segment_length}."


# Represents a nested list of integers. E.g., [1, [2, [3], 4], 5, 6].
NestedIntList = Union[int, List[Any]]
