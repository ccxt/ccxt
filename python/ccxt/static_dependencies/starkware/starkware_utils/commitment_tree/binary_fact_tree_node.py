import asyncio
from abc import ABC, abstractmethod
from typing import AsyncIterator, Collection, Dict, List, Optional, Tuple, Type, TypeVar

from starkware.python.utils import from_bytes
from starkware.starkware_utils.commitment_tree.binary_fact_tree import BinaryFactDict, TLeafFact
from starkware.starkware_utils.commitment_tree.inner_node_fact import InnerNodeFact
from starkware.starkware_utils.commitment_tree.merkle_tree.traverse_tree import traverse_tree
from starkware.storage.storage import FactFetchingContext

TInnerNodeFact = TypeVar("TInnerNodeFact", bound=InnerNodeFact)
TBinaryFactTreeNode = TypeVar("TBinaryFactTreeNode", bound="BinaryFactTreeNode")
_BinaryFactTreeNodePair = Tuple[TBinaryFactTreeNode, TBinaryFactTreeNode]
_BinaryFactTreeDiff = Tuple[int, _BinaryFactTreeNodePair]


class BinaryFactTreeNode(ABC):
    """
    Represents a binary node in a binary fact tree.
    Contains methods that allow traversal downwards the tree this node is a part of, as well as
    building new subtrees according to modified leaf information.
    """

    @property
    def is_leaf(self) -> bool:
        return self.get_height_in_tree() == 0

    @property
    def leaf_hash(self) -> bytes:
        """
        Returns the hash of self, which must be a leaf to use this property.
        """
        assert self.is_leaf, (
            f"leaf_hash property must only be called on leaf nodes; got: height "
            f"{self.get_height_in_tree()}."
        )

        return self._leaf_hash

    @abstractmethod
    def get_height_in_tree(self) -> int:
        """
        Returns the height of the node in a tree.
        """

    @property
    @abstractmethod
    def _leaf_hash(self) -> bytes:
        pass

    @classmethod
    @abstractmethod
    def create_leaf(cls: Type[TBinaryFactTreeNode], hash_value: bytes) -> TBinaryFactTreeNode:
        pass

    @abstractmethod
    async def get_children(
        self, ffc: FactFetchingContext, facts: Optional[BinaryFactDict] = None
    ) -> Tuple["BinaryFactTreeNode", "BinaryFactTreeNode"]:
        """
        Returns the two BinaryFactTreeNode objects which are the roots of the subtrees of the
        current BinaryFactTreeNode.

        If facts argument is not None, this dictionary is filled with facts read from the DB.
        """

    @abstractmethod
    def __eq__(self, other: object) -> bool:
        """
        Return True iff the nodes represent the same node in a tree.
        """

    async def _get_leaves(
        self,
        ffc: FactFetchingContext,
        indices: Collection[int],
        fact_cls: Type[TLeafFact],
        facts: Optional[BinaryFactDict] = None,
    ) -> Dict[int, TLeafFact]:
        """
        Returns the values of the leaves whose indices are given.

        If facts argument is not None, this dictionary is filled during traversal through the tree
        by the facts of their paths from the root down.

        This method is to be called by a get_leaves() method of a specific tree implementation
        (derived class of BinaryFactTree).
        """
        if len(indices) == 0:
            return {}

        if self.is_leaf:
            return await self._get_leaf(ffc=ffc, indices=indices, fact_cls=fact_cls)

        return await self._get_binary_node_leaves(
            ffc=ffc, indices=indices, fact_cls=fact_cls, facts=facts
        )

    async def _get_binary_node_leaves(
        self,
        ffc: FactFetchingContext,
        indices: Collection[int],
        fact_cls: Type[TLeafFact],
        facts: Optional[BinaryFactDict],
    ) -> Dict[int, TLeafFact]:
        """
        Returns the values of the leaves whose indices are given.
        """
        # Partition indices.
        mid = 2 ** (self.get_height_in_tree() - 1)
        left_indices = [index for index in indices if index < mid]
        right_indices = [(index - mid) for index in indices if index >= mid]

        # Get children.
        left_child, right_child = await self.get_children(ffc=ffc, facts=facts)

        # Optimizations in order to avoid a redundant asyncio.gather call that postpones the
        # execution of the recursive task.
        if len(left_indices) == 0:
            right_leaves = await right_child._get_leaves(
                ffc=ffc, indices=right_indices, fact_cls=fact_cls, facts=facts
            )
            return unify_binary_leaves(middle_index=mid, right_leaves=right_leaves, left_leaves={})

        if len(right_indices) == 0:
            left_leaves = await left_child._get_leaves(
                ffc=ffc, indices=left_indices, fact_cls=fact_cls, facts=facts
            )
            return unify_binary_leaves(middle_index=mid, right_leaves={}, left_leaves=left_leaves)

        left_leaves, right_leaves = await asyncio.gather(
            left_child._get_leaves(ffc=ffc, indices=left_indices, fact_cls=fact_cls, facts=facts),
            right_child._get_leaves(ffc=ffc, indices=right_indices, fact_cls=fact_cls, facts=facts),
        )
        return unify_binary_leaves(
            middle_index=mid, left_leaves=left_leaves, right_leaves=right_leaves
        )

    async def get_diff_between_trees(
        self,
        other: TBinaryFactTreeNode,
        ffc: FactFetchingContext,
        fact_cls: Type[TLeafFact],
        facts: Optional[BinaryFactDict] = None,
    ) -> List[Tuple[int, TLeafFact, TLeafFact]]:
        """
        Returns a list of (key, old_fact, new_fact) that are different
        between this tree and another.

        The height of the two trees must be equal.

        If the 'facts' argument is not None, this dictionary is filled with facts read from the DB.
        """
        assert self.get_height_in_tree() == other.get_height_in_tree(), (
            f"Tree heights must be equal. Got: {other.get_height_in_tree()} for 'other'; "
            f"expected: {self.get_height_in_tree()}."
        )
        result: List[Tuple[int, TLeafFact, TLeafFact]] = []

        async def get_children_callback(
            node: _BinaryFactTreeDiff,
        ) -> AsyncIterator[_BinaryFactTreeDiff]:
            path, (previous, current) = node
            if previous.is_leaf:
                result.append(
                    (
                        path,
                        await fact_cls.get_or_fail(suffix=previous.leaf_hash, storage=ffc.storage),
                        await fact_cls.get_or_fail(suffix=current.leaf_hash, storage=ffc.storage),
                    )
                )
                return

            previous_left, previous_right = await previous.get_children(ffc=ffc, facts=facts)
            current_left, current_right = await current.get_children(ffc=ffc, facts=facts)

            if previous_left != current_left:
                # Shift left for the left child.
                yield (path << 1, (previous_left, current_left))

            if previous_right != current_right:
                # Shift left and turn on the LSB bit for the right child.
                yield ((path << 1) + 1, (previous_right, current_right))

        await traverse_tree(
            get_children_callback=get_children_callback,
            root=(0, (self, other)),
            n_workers=ffc.n_workers,
        )

        return result

    async def _get_leaf(
        self, ffc: FactFetchingContext, indices: Collection[int], fact_cls: Type[TLeafFact]
    ) -> Dict[int, TLeafFact]:
        assert set(indices) == {0}, f"Commitment tree indices out of range: {indices}."
        leaf = await fact_cls.get_or_fail(storage=ffc.storage, suffix=self.leaf_hash)

        return {0: leaf}


# Utilities.


def unify_binary_leaves(
    middle_index: int, left_leaves: Dict[int, TLeafFact], right_leaves: Dict[int, TLeafFact]
) -> Dict[int, TLeafFact]:
    return {**left_leaves, **{x + middle_index: y for x, y in right_leaves.items()}}


async def read_node_fact(
    ffc: FactFetchingContext,
    inner_node_fact_cls: Type[TInnerNodeFact],
    fact_hash: bytes,
    facts: Optional[BinaryFactDict],
) -> TInnerNodeFact:
    node_fact = await inner_node_fact_cls.get_or_fail(storage=ffc.storage, suffix=fact_hash)

    if facts is not None:
        facts[from_bytes(fact_hash)] = node_fact.to_tuple()

    return node_fact


async def write_node_fact(
    ffc: FactFetchingContext, inner_node_fact: InnerNodeFact, facts: Optional[BinaryFactDict]
) -> bytes:
    fact_hash = await inner_node_fact.set_fact(ffc=ffc)

    if facts is not None:
        facts[from_bytes(fact_hash)] = inner_node_fact.to_tuple()

    return fact_hash
