from typing import Any, AsyncIterator, Collection, Dict, NamedTuple, Optional, Tuple, Type, Union

from starkware.python.utils import from_bytes, gather_in_chunks
from starkware.starkware_utils.commitment_tree.binary_fact_tree import BinaryFactDict
from starkware.starkware_utils.commitment_tree.binary_fact_tree_node import (
    BinaryFactTreeNode,
    TBinaryFactTreeNode,
)
from starkware.starkware_utils.commitment_tree.calculation import CalculationNode, NodeFactDict
from starkware.starkware_utils.commitment_tree.leaf_fact import LeafFact
from starkware.starkware_utils.commitment_tree.merkle_tree.traverse_tree import traverse_tree
from starkware.starkware_utils.executor import executor_ctx_var
from starkware.storage.storage import FactFetchingContext

# Should be Tuple["UpdateTree", "UpdateTree"], but recursive types are not supported in mypy:
#   https://github.com/python/mypy/issues/731.
UpdateTree = Optional[Union[Tuple[Any, Any], LeafFact]]
NodeType = NamedTuple(
    "NodeType", [("index", int), ("tree", BinaryFactTreeNode), ("update", UpdateTree)]
)


async def update_tree(
    tree: TBinaryFactTreeNode,
    ffc: FactFetchingContext,
    modifications: Collection[Tuple[int, LeafFact]],
    calculation_node_cls: Type[CalculationNode],
    facts: Optional[BinaryFactDict] = None,
) -> TBinaryFactTreeNode:
    """
    Updates the tree with the given list of modifications, writes all the new facts to the
    storage and returns a new BinaryFactTree representing the fact of the root of the new tree.

    If facts argument is not None, this dictionary is filled during building the new tree
    by the facts of the modified nodes (the modified leaves won't enter to this dict as they are
    already known to the function caller).

    This method is to be called by a update() method of a specific tree implementation
    (derived class of BinaryFactTree).

    For efficiency, the function does not compute and store the new facts while traversing the
    tree. Instead, it first traverses the tree to fetch the needed facts for the update. It then
    computes the new facts. Once all facts are computed, it finally stores them.
    """
    # A map from node index to the updated subtree, in which inner nodes are not hashed yet, but
    # rather consist of their children.
    # This map is populated when we traverse a node and know its value in the updated tree.
    # This happens when either of these happens:
    # 1. The node has no updates => value remains the same.
    # 2. Node is a leaf update, and we just updated the leaf value.
    # 3. When its two children are already updated (happens in update_necessary()).
    updated_nodes: Dict[int, CalculationNode] = {}
    new_facts = NodeFactDict()

    async def update_necessary(node_index: int):
        """
        Checks if there are merkle nodes that are not updated, but all of its children are.
        Starts at node_index, and goes up to the root.
        """
        # Xoring by 1 switch between 2k <-> 2k + 1, which are siblings in the tree.
        # The parent of these siblings is k = floor(n/2) for n = 2k, 2k+1.
        while node_index ^ 1 in updated_nodes:
            node_index //= 2
            updated_nodes[node_index] = await calculation_node_cls.combine(
                ffc=ffc,
                left=updated_nodes[2 * node_index],
                right=updated_nodes[2 * node_index + 1],
                facts=facts,
            )

            del updated_nodes[2 * node_index]
            del updated_nodes[2 * node_index + 1]

    async def update_if_possible(node_index: int, binary_fact_tree_node: BinaryFactTreeNode):
        updated_nodes[node_index] = calculation_node_cls.create_from_node(
            node=binary_fact_tree_node,
        )
        await update_necessary(node_index=node_index)

    async def set_fact(new_fact: UpdateTree, node_index: int):
        assert isinstance(new_fact, LeafFact)

        updated_nodes[node_index] = calculation_node_cls.create_from_fact(fact=new_fact)
        await update_necessary(node_index=node_index)

    async def traverse_node(node: NodeType) -> AsyncIterator[NodeType]:
        """
        Callback function for traverse_tree().
        If the current node has leaf updates, get its children, and traverse them.
        If the current node has no updates, do nothing.
        If the current node is a leaf, update the leaf.
        """
        node_index, binary_fact_tree_node, update_subtree = node

        if update_subtree is None:
            # No updates to subtree.
            await update_if_possible(
                node_index=node_index, binary_fact_tree_node=binary_fact_tree_node
            )
            return

        if binary_fact_tree_node.is_leaf:
            # Leaf update.
            await set_fact(new_fact=update_subtree, node_index=node_index)
            return

        # Inner node with updates.
        assert isinstance(update_subtree, tuple)
        left, right = await binary_fact_tree_node.get_children(ffc, facts=facts)
        yield NodeType(index=2 * node_index, tree=left, update=update_subtree[0])
        yield NodeType(index=2 * node_index + 1, tree=right, update=update_subtree[1])

    async def build_updated_calculation() -> CalculationNode:
        update_tree = build_update_tree(
            height=tree.get_height_in_tree(), modifications=modifications
        )
        first_node = NodeType(index=1, tree=tree, update=update_tree)
        await traverse_tree(
            get_children_callback=traverse_node, root=first_node, n_workers=ffc.n_workers
        )

        # Since the updated_nodes dictionary cleans itself, we expect only the new root to be
        # present, at node index 1.
        assert len(updated_nodes) == 1 and 1 in updated_nodes
        return updated_nodes[1]

    updated_calc_node = await build_updated_calculation()

    root_node = await updated_calc_node.full_calculate_with_executor(
        executor=executor_ctx_var.get(), hash_func=ffc.hash_func, fact_nodes=new_facts, depth=5
    )

    await write_fact_nodes(ffc=ffc, fact_nodes=new_facts)

    if facts is not None:
        # The leaves aren't stored in `facts`. Only nodes are stored there.
        for fact_hash, node_fact in new_facts.inner_nodes.items():
            facts[from_bytes(fact_hash)] = node_fact.to_tuple()

    return root_node


def build_update_tree(height: int, modifications: Collection[Tuple[int, LeafFact]]) -> UpdateTree:
    """
    Constructs a tree from leaf updates. This is not a full binary tree. It is just the subtree
    induced by the modification leaves.
    Returns a tree. A tree is either:
     * None (if no modifications exist in its subtree).
     * A leaf (if a single modification is given at height 0; i.e., a leaf).
     * A pair of trees.
    """
    # Bottom layer. This will prefer the last modification to an index.
    if len(modifications) == 0:
        return None

    # A layer is a dictionary from index in current merkle layer [0, 2**layer_height) to a tree.
    # A tree is either None, a leaf, or a pair of trees.
    layer: Dict[int, UpdateTree] = dict(modifications)

    for _ in range(height):
        parents = set(index // 2 for index in layer.keys())
        # Note that dictionary.get(key) is None if the key is not in the dictionary.
        layer = {index: (layer.get(index * 2), layer.get(index * 2 + 1)) for index in parents}

    # We reached layer_height=0, the top layer with only the root (with index 0).
    assert len(layer) == 1
    return layer[0]


async def write_fact_nodes(ffc: FactFetchingContext, fact_nodes: NodeFactDict):
    await gather_in_chunks(
        root_node.set(storage=ffc.storage, suffix=root_hash)
        for root_hash, root_node in fact_nodes.items()
    )
