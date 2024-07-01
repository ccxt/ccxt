from typing import Collection, Dict, List, Optional, Tuple, Type

import marshmallow_dataclass

from starkware.starkware_utils.commitment_tree.binary_fact_tree import (
    BinaryFactDict,
    BinaryFactTree,
    TLeafFact,
)
from starkware.starkware_utils.commitment_tree.leaf_fact import LeafFact
from starkware.starkware_utils.commitment_tree.patricia_tree.fast_patricia_update import (
    update_tree as update_tree_efficiently,
)
from starkware.starkware_utils.commitment_tree.patricia_tree.nodes import EmptyNodeFact
from starkware.starkware_utils.commitment_tree.patricia_tree.virtual_calculation_node import (
    VirtualCalculationNode,
)
from starkware.starkware_utils.commitment_tree.patricia_tree.virtual_patricia_node import (
    VirtualPatriciaNode,
)
from starkware.starkware_utils.commitment_tree.update_tree import update_tree
from starkware.storage.storage import FactFetchingContext


@marshmallow_dataclass.dataclass(frozen=True)
class PatriciaTree(BinaryFactTree):
    """
    An immutable Patricia-Merkle tree backed by an immutable fact storage.
    """

    @classmethod
    async def empty_tree(
        cls, ffc: FactFetchingContext, height: int, leaf_fact: LeafFact
    ) -> "PatriciaTree":
        """
        Initializes an empty PatriciaTree of the given height.
        """
        empty_leaf_fact_hash = await leaf_fact.set_fact(ffc=ffc)
        assert empty_leaf_fact_hash == EmptyNodeFact.EMPTY_NODE_HASH, (
            f"The hash value of an empty leaf fact must be {EmptyNodeFact.EMPTY_NODE_HASH.hex()}; "
            f"got: {empty_leaf_fact_hash.hex()}."
        )

        return PatriciaTree(root=EmptyNodeFact.EMPTY_NODE_HASH, height=height)

    async def _get_leaves(
        self,
        ffc: FactFetchingContext,
        indices: Collection[int],
        fact_cls: Type[TLeafFact],
        facts: Optional[BinaryFactDict] = None,
    ) -> Dict[int, TLeafFact]:
        """
        Returns the values of the leaves whose indices are given.
        """
        virtual_root_node = VirtualPatriciaNode.from_hash(hash_value=self.root, height=self.height)
        return await virtual_root_node._get_leaves(
            ffc=ffc, indices=indices, fact_cls=fact_cls, facts=facts
        )

    async def update(
        self,
        ffc: FactFetchingContext,
        modifications: Collection[Tuple[int, LeafFact]],
        facts: Optional[BinaryFactDict] = None,
    ) -> "PatriciaTree":
        """
        Updates the tree with the given list of modifications, writes all the new facts to the
        storage and returns a new PatriciaTree representing the fact of the root of the new tree.
        """
        virtual_root_node = VirtualPatriciaNode.from_hash(hash_value=self.root, height=self.height)
        updated_virtual_root_node = await update_tree(
            tree=virtual_root_node,
            ffc=ffc,
            modifications=modifications,
            facts=facts,
            calculation_node_cls=VirtualCalculationNode,
        )

        # In case root is an edge node, its fact must be explicitly written to DB.
        root_hash = await updated_virtual_root_node.commit(ffc=ffc, facts=facts)
        return PatriciaTree(root=root_hash, height=updated_virtual_root_node.height)

    async def update_efficiently(
        self,
        ffc: FactFetchingContext,
        modifications: Collection[Tuple[int, LeafFact]],
    ) -> "PatriciaTree":
        """
        Updates the tree with the given list of modifications, writes all the new facts to the
        storage and returns a new PatriciaTree representing the fact of the root of the new tree.
        This method is more efficient than `update`.
        """
        updated_root = await update_tree_efficiently(
            height=self.height, root=self.root, modifications=modifications, ffc=ffc
        )
        return PatriciaTree(root=updated_root, height=self.height)

    async def get_diff_between_patricia_trees(
        self,
        other: "PatriciaTree",
        ffc: FactFetchingContext,
        storage_tree_height: int,
        fact_cls: Type[TLeafFact],
    ) -> List[Tuple[int, TLeafFact, TLeafFact]]:
        """
        Returns a list of (key, old_fact, new_fact) that are different
        between this tree and another.

        The height of the two trees must be equal.

        If the 'facts' argument is not None, this dictionary is filled with facts read from the DB.
        """
        self_node, other_node = [
            VirtualPatriciaNode.from_hash(hash_value=hash_value, height=storage_tree_height)
            for hash_value in (self.root, other.root)
        ]
        return await self_node.get_diff_between_trees(other=other_node, ffc=ffc, fact_cls=fact_cls)
