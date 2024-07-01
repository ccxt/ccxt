import dataclasses
from abc import abstractmethod
from typing import ClassVar, List, Tuple, Type

from starkware.python.utils import blockify, from_bytes, to_bytes
from starkware.starkware_utils.commitment_tree.inner_node_fact import InnerNodeFact
from starkware.storage.storage import HASH_BYTES, HashFunctionType


# NOTE: We avoid using ValidatedDataclass here for performance.
class PatriciaNodeFact(InnerNodeFact):
    """
    Base abstract class of Patricia-Merkle tree nodes.
    """

    # Class variables.
    HASH_BYTES_LENGTH: ClassVar[int] = HASH_BYTES

    @classmethod
    def prefix(cls) -> bytes:
        return b"patricia_node"

    @property
    @classmethod
    @abstractmethod
    def PREIMAGE_LENGTH(self) -> int:
        """
        Returns the length of the fact key (its preimage) in bytes.
        Used to distinguish between node fact types.
        Subclasses should define it as a class variable.
        """

    @classmethod
    def deserialize(cls, data: bytes) -> "PatriciaNodeFact":
        node_fact_cls = get_node_type(fact_preimage=data)
        return node_fact_cls.deserialize(data=data)


class EmptyNodeFact(PatriciaNodeFact):
    """
    Represents the root of an empty (all leaves are 0) full binary tree.
    """

    # Class variables.
    PREIMAGE_LENGTH: ClassVar[int] = 0
    EMPTY_NODE_HASH: ClassVar[bytes] = bytes(PatriciaNodeFact.HASH_BYTES_LENGTH)

    def serialize(self) -> bytes:
        return b""

    @classmethod
    def deserialize(cls, data: bytes) -> "EmptyNodeFact":
        return cls()

    def _hash(self, hash_func: HashFunctionType) -> bytes:
        """
        Computes the hash value of the empty node, which is zero.
        """
        return self.EMPTY_NODE_HASH

    def to_tuple(self) -> Tuple[int, ...]:
        return ()


def verify_path_value(path: int, length: int):
    assert (
        0 <= path < (1 << length)
    ), f"Edge path must be at most of length {length}; got: {bin(path)}."


# NOTE: We avoid using ValidatedDataclass here for performance.
@dataclasses.dataclass(frozen=True)
class BinaryNodeFact(PatriciaNodeFact):
    """
    A binary node in a Patricia-Merkle tree; this is a regular Merkle node.
    """

    left_node: bytes  # 32B.
    right_node: bytes  # 32B.

    # Class variables.
    PREIMAGE_LENGTH: ClassVar[int] = 2 * HASH_BYTES

    def __post_init__(self):
        legal_binary_node = (
            self.left_node != EmptyNodeFact.EMPTY_NODE_HASH
            and self.right_node != EmptyNodeFact.EMPTY_NODE_HASH
        )
        assert (
            legal_binary_node
        ), "It is not allowed for any child of a binary node to be the empty node."

    def serialize(self) -> bytes:
        return self.left_node + self.right_node

    @classmethod
    def deserialize(cls, data: bytes) -> "BinaryNodeFact":
        return cls(
            left_node=data[: cls.HASH_BYTES_LENGTH], right_node=data[cls.HASH_BYTES_LENGTH :]
        )

    def _hash(self, hash_func: HashFunctionType) -> bytes:
        """
        Computes the hash value of the edge node: hash(hash(left_node), hash(right_node)).
        """
        return hash_func(self.left_node, self.right_node)

    def to_tuple(self) -> Tuple[int, ...]:
        return from_bytes(self.left_node), from_bytes(self.right_node)


# NOTE: We avoid using ValidatedDataclass here for performance.
@dataclasses.dataclass(frozen=True)
class EdgeNodeFact(PatriciaNodeFact):
    """
    A node in a Patricia-Merkle tree that represents the edge to a subtree that contains data
    with value != 0.
    Represented by three values embedding this information (elaborated below).
    Note that the bottom_node cannot be an edge node itself (otherwise, they would have both been
    fused to a bigger edge node).
    """

    # The root of the subtree containing data with value != 0.
    # See patricia_utils.py for more details.
    bottom_node: bytes  # 32B.
    # The binary representation of the leaf index in the subtree that this node is root of.
    edge_path: int  # 32B.
    # The height of the edge node (the length of the path to the leaf).
    edge_length: int  # 1B.

    # Class variables.
    PREIMAGE_LENGTH: ClassVar[int] = 2 * HASH_BYTES + 1

    def __post_init__(self):
        assert (
            self.edge_length > 0
        ), f"The length of an edge node must be positive; got: {self.edge_length}."
        verify_path_value(path=self.edge_path, length=self.edge_length)

    def serialize(self) -> bytes:
        return serialize_edge(bottom=self.bottom_node, path=self.edge_path, length=self.edge_length)

    @classmethod
    def deserialize(cls, data: bytes) -> "EdgeNodeFact":
        bottom_node, edge_path, edge_length = deserialize_edge(data=data)
        return cls(bottom_node=bottom_node, edge_path=edge_path, edge_length=edge_length)

    def _hash(self, hash_func: HashFunctionType) -> bytes:
        """
        Computes the hash value of the edge node: hash(bottom_node, edge_path) + edge_length.
        """
        return hash_edge(
            bottom=self.bottom_node,
            path=self.edge_path,
            length=self.edge_length,
            hash_func=hash_func,
        )

    def to_tuple(self) -> Tuple[int, ...]:
        return self.edge_length, self.edge_path, from_bytes(self.bottom_node)


def get_node_type(fact_preimage: bytes) -> Type["PatriciaNodeFact"]:
    """
    Returns the node fact type according to the fact preimage length.
    """
    preimage_length = len(fact_preimage)

    node_fact_classes: List[Type[PatriciaNodeFact]] = [BinaryNodeFact, EdgeNodeFact, EmptyNodeFact]
    for node_fact_cls in node_fact_classes:
        if preimage_length == node_fact_cls.PREIMAGE_LENGTH:
            return node_fact_cls

    raise NotImplementedError(f"Unsupported fact preimage length: {preimage_length}.")


# Shared code with another Patricia implementation.


def serialize_edge(bottom: bytes, path: int, length: int) -> bytes:
    return bottom + to_bytes(path) + to_bytes(length, length=1)


def deserialize_edge(data: bytes) -> Tuple[bytes, int, int]:
    bottom, path, length = blockify(data=data, chunk_size=EdgeNodeFact.HASH_BYTES_LENGTH)
    return bottom, from_bytes(path), from_bytes(length)


def hash_edge(bottom: bytes, path: int, length: int, hash_func: HashFunctionType) -> bytes:
    bottom_path_hash = hash_func(bottom, to_bytes(path))

    # Add the edge length.
    hash_value = from_bytes(bottom_path_hash) + length

    return to_bytes(hash_value)
