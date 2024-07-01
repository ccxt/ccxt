import dataclasses
from typing import Collection, Dict, Optional, Tuple, Type

from starkware.starkware_utils.commitment_tree.binary_fact_tree import BinaryFactDict
from starkware.starkware_utils.commitment_tree.binary_fact_tree_node import (
    BinaryFactTreeNode,
    read_node_fact,
    write_node_fact,
)
from starkware.starkware_utils.commitment_tree.leaf_fact import TLeafFact
from starkware.starkware_utils.commitment_tree.patricia_tree.nodes import (
    BinaryNodeFact,
    EdgeNodeFact,
    EmptyNodeFact,
    PatriciaNodeFact,
    verify_path_value,
)
from starkware.storage.storage import FactFetchingContext


# NOTE: We avoid using ValidatedDataclass here for performance.
@dataclasses.dataclass(frozen=True)
class VirtualPatriciaNode(BinaryFactTreeNode):
    """
    Represents a virtual Patricia node.
    Virtual node instances are used to build and traverse through a Patricia tree.
    The main purpose of this class is to maintain the information of a virtual edge node up until
    the point it can be hashed (committed).
    """

    # The information of the virtual node.
    bottom_node: bytes
    path: int
    length: int

    # The height of the subtree rooted at this node.
    # In other words, this is the length of the path from this node to the leaves.
    height: int

    def __post_init__(self):
        """
        Performs validations on the constructed object.
        Note that many of the functions in this class rely on the invariants checked in this
        function, and on the fact they are made at initialization time (the object is immutable).
        """
        verify_path_value(path=self.path, length=self.length)

    @classmethod
    def empty_node(cls, height: int) -> "VirtualPatriciaNode":
        return cls(bottom_node=EmptyNodeFact.EMPTY_NODE_HASH, path=0, length=0, height=height)

    @classmethod
    def from_hash(cls, hash_value: bytes, height: int) -> "VirtualPatriciaNode":
        """
        Returns a virtual Patricia node of the form (hash, 0, 0).
        """
        return cls(bottom_node=hash_value, path=0, length=0, height=height)

    @classmethod
    def create_leaf(cls, hash_value: bytes) -> "VirtualPatriciaNode":
        return cls.from_hash(hash_value=hash_value, height=0)

    async def read_bottom_node_fact(
        self, ffc: FactFetchingContext, facts: Optional[BinaryFactDict]
    ) -> PatriciaNodeFact:
        return await read_node_fact(
            ffc=ffc,
            inner_node_fact_cls=PatriciaNodeFact,  # type: ignore
            fact_hash=self.bottom_node,
            facts=facts,
        )

    @property
    def is_empty(self) -> bool:
        return self.bottom_node == EmptyNodeFact.EMPTY_NODE_HASH

    @property
    def is_virtual_edge(self) -> bool:
        return self.length != 0

    @property
    def _leaf_hash(self) -> bytes:
        return self.bottom_node

    def get_height_in_tree(self) -> int:
        return self.height

    async def commit(self, ffc: FactFetchingContext, facts: Optional[BinaryFactDict]) -> bytes:
        """
        Calculates and returns the hash of self.
        If this is a virtual edge node, an edge node fact is written to the DB.
        """
        if not self.is_virtual_edge:
            # Node is already of form (hash, 0, 0); no work to be done.
            return self.bottom_node

        edge_node_fact = EdgeNodeFact(
            bottom_node=self.bottom_node, edge_path=self.path, edge_length=self.length
        )
        return await write_node_fact(ffc=ffc, inner_node_fact=edge_node_fact, facts=facts)

    async def get_children(
        self, ffc: FactFetchingContext, facts: Optional[BinaryFactDict] = None
    ) -> Tuple["VirtualPatriciaNode", "VirtualPatriciaNode"]:
        """
        Returns the two VirtualPatriciaNode objects which are the subtrees of the current
        VirtualPatriciaNode.

        If facts argument is not None, this dictionary is filled with facts read from the DB.
        """
        assert not self.is_leaf, "get_children() must not be called on leaves."

        children_height = self.height - 1
        if self.is_empty:
            empty_child = VirtualPatriciaNode.empty_node(height=children_height)
            return empty_child, empty_child

        if self.is_virtual_edge:
            return self._get_virtual_edge_node_children()

        # At this point the preimage of self.bottom_node must be read from the storage, to know
        # what kind of node it represents - a committed edge node, or a binary node.
        fact = await self.read_bottom_node_fact(ffc=ffc, facts=facts)

        if isinstance(fact, EdgeNodeFact):
            # A previously committed edge node.
            edge_node = VirtualPatriciaNode(
                bottom_node=fact.bottom_node,
                path=fact.edge_path,
                length=fact.edge_length,
                height=self.height,
            )
            return edge_node._get_virtual_edge_node_children()

        assert isinstance(fact, BinaryNodeFact)
        return (
            self.from_hash(hash_value=fact.left_node, height=children_height),
            self.from_hash(hash_value=fact.right_node, height=children_height),
        )

    def _get_virtual_edge_node_children(
        self,
    ) -> Tuple["VirtualPatriciaNode", "VirtualPatriciaNode"]:
        """
        Returns the children of a virtual edge node: an empty node and a shorter-by-one virtual
        edge node, according to the direction embedded in the edge path.
        """
        children_height = self.height - 1
        children_length = self.length - 1
        non_empty_child = VirtualPatriciaNode(
            bottom_node=self.bottom_node,
            path=self.path & ((1 << children_length) - 1),  # Turn the MSB bit off.
            length=children_length,
            height=children_height,
        )

        edge_child_direction = self.path >> children_length
        empty_child = VirtualPatriciaNode.empty_node(height=children_height)
        if edge_child_direction == 0:
            # Non-empty on the left.
            return non_empty_child, empty_child
        else:
            # Non-empty on the right.
            return empty_child, non_empty_child

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, VirtualPatriciaNode):
            return NotImplemented

        return (
            self.bottom_node == other.bottom_node
            and self.path == other.path
            and self.length == other.length
            and self.height == other.height
        )

    async def _get_leaves(
        self,
        ffc: FactFetchingContext,
        indices: Collection[int],
        fact_cls: Type[TLeafFact],
        facts: Optional[BinaryFactDict] = None,
    ) -> Dict[int, TLeafFact]:
        """
        See base class for documentation.
        """
        if len(indices) == 0:
            return {}

        if self.is_empty:
            return await get_empty_leaves(ffc=ffc, indices=indices, fact_cls=fact_cls)

        if self.is_leaf:
            return await self._get_leaf(ffc=ffc, indices=indices, fact_cls=fact_cls)

        if self.is_virtual_edge:
            return await self._get_edge_node_leaves(
                ffc=ffc, indices=indices, fact_cls=fact_cls, facts=facts
            )

        return await self._get_binary_node_leaves(
            ffc=ffc, indices=indices, fact_cls=fact_cls, facts=facts
        )

    async def _get_edge_node_leaves(
        self,
        ffc: FactFetchingContext,
        indices: Collection[int],
        fact_cls: Type[TLeafFact],
        facts: Optional[BinaryFactDict] = None,
    ) -> Dict[int, TLeafFact]:
        """
        Returns the values of the leaves whose indices are given.
        """
        # Partition indices.
        path_suffix_width = self.height - self.length
        path_prefix = self.path << path_suffix_width
        bottom_subtree_indices = [
            index - path_prefix for index in indices if (index >> path_suffix_width) == self.path
        ]
        empty_indices = [index for index in indices if (index >> path_suffix_width) != self.path]

        # Get bottom subtree root.
        bottom_subtree_root = self.from_hash(hash_value=self.bottom_node, height=path_suffix_width)
        bottom_subtree_leaves = await bottom_subtree_root._get_leaves(
            ffc=ffc, indices=bottom_subtree_indices, fact_cls=fact_cls, facts=facts
        )
        empty_leaves = await get_empty_leaves(ffc=ffc, indices=empty_indices, fact_cls=fact_cls)
        return unify_edge_leaves(
            path_prefix=path_prefix,
            bottom_subtree_leaves=bottom_subtree_leaves,
            empty_leaves=empty_leaves,
        )


# Utilities.


async def get_empty_leaves(
    ffc: FactFetchingContext, indices: Collection[int], fact_cls: Type[TLeafFact]
) -> Dict[int, TLeafFact]:
    if len(indices) == 0:
        return {}

    empty_leaf = await fact_cls.get_or_fail(
        storage=ffc.storage, suffix=EmptyNodeFact.EMPTY_NODE_HASH
    )
    return {index: empty_leaf for index in indices}


def unify_edge_leaves(
    path_prefix: int,
    bottom_subtree_leaves: Dict[int, TLeafFact],
    empty_leaves: Dict[int, TLeafFact],
) -> Dict[int, TLeafFact]:
    return {**empty_leaves, **{x + path_prefix: y for x, y in bottom_subtree_leaves.items()}}
