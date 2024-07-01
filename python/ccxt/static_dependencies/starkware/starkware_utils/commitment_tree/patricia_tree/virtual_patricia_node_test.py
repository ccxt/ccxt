import asyncio
import random
from typing import Collection, Dict

import pytest

from starkware.cairo.common.patricia_utils import compute_patricia_from_leaves_for_test
from starkware.crypto.signature.fast_pedersen_hash import pedersen_hash, pedersen_hash_func
from starkware.python.random_test_utils import random_test
from starkware.python.utils import safe_zip, to_bytes
from starkware.starkware_utils.commitment_tree.patricia_tree.nodes import (
    BinaryNodeFact,
    EdgeNodeFact,
)
from starkware.starkware_utils.commitment_tree.patricia_tree.patricia_tree import PatriciaTree
from starkware.starkware_utils.commitment_tree.patricia_tree.virtual_calculation_node import (
    VirtualCalculationNode,
)
from starkware.starkware_utils.commitment_tree.patricia_tree.virtual_patricia_node import (
    VirtualPatriciaNode,
)
from starkware.starkware_utils.commitment_tree.update_tree import update_tree
from starkware.storage.storage import FactFetchingContext
from starkware.storage.storage_utils import SimpleLeafFact
from starkware.storage.test_utils import MockStorage

# Fixtures.


@pytest.fixture
def ffc() -> FactFetchingContext:
    return FactFetchingContext(storage=MockStorage(), hash_func=pedersen_hash_func)


# Utilities.


async def make_virtual_edge_non_canonical(
    ffc: FactFetchingContext, node: VirtualPatriciaNode
) -> VirtualPatriciaNode:
    """
    Returns the non-canonical form (hash, 0, 0) of a virtual edge node.
    """
    assert node.is_virtual_edge, "Node should be of canonical form."

    node_hash = await node.commit(ffc=ffc, facts=None)
    return VirtualPatriciaNode.from_hash(hash_value=node_hash, height=node.height)


def verify_root(leaves: Collection[int], expected_root_hash: bytes):
    root_hash, _preimage, _node_at_path = compute_patricia_from_leaves_for_test(
        leaves=leaves, hash_func=pedersen_hash
    )
    assert expected_root_hash == to_bytes(root_hash)


async def build_empty_patricia_virtual_node(
    ffc: FactFetchingContext, height: int
) -> VirtualPatriciaNode:
    # Done manually, since PatriciaTree.empty() is in charge of that and is not used here.
    await SimpleLeafFact.empty().set_fact(ffc=ffc)

    # Build empty tree.
    return VirtualPatriciaNode.empty_node(height=height)


async def build_patricia_virtual_node(
    ffc: FactFetchingContext, height: int, leaves: Dict[int, SimpleLeafFact]
) -> VirtualPatriciaNode:
    # Build empty tree.
    tree = await build_empty_patricia_virtual_node(ffc=ffc, height=height)
    return await update_tree(
        tree=tree,
        ffc=ffc,
        modifications=leaves.items(),
        calculation_node_cls=VirtualCalculationNode,
    )


async def sample_and_verify_leaf_values(
    ffc: FactFetchingContext, tree: VirtualPatriciaNode, expected_leaves: Dict[int, SimpleLeafFact]
):
    sampled_indices = list(expected_leaves.keys())
    actual_leaves = await tree._get_leaves(
        ffc=ffc, indices=sampled_indices, fact_cls=SimpleLeafFact
    )
    assert actual_leaves == expected_leaves


# Tests.


@pytest.mark.asyncio
async def test_get_children(ffc: FactFetchingContext):
    """
    Builds a Patricia tree of length 3 with the following values in the leaves: 1 -> 12, 6 -> 30.
    This is done using only "low-level" VirtualPatriciaNode methods, without _update().
    #              0
    #        0           0
    #     0     0     0     0
    #   0  12 0   0 0   0 30  0
    """
    # Create empty trees and write their facts to DB.
    empty_tree_0 = await build_empty_patricia_virtual_node(ffc=ffc, height=0)
    empty_tree_1 = await build_empty_patricia_virtual_node(ffc=ffc, height=1)
    assert await empty_tree_1.get_children(ffc=ffc) == (empty_tree_0, empty_tree_0)

    # Create leaves and write their facts to DB.
    leaf_hash_12, leaf_hash_30 = await asyncio.gather(
        *(
            leaf_fact.set_fact(ffc=ffc)
            for leaf_fact in (SimpleLeafFact(value=12), SimpleLeafFact(value=30))
        )
    )
    leaf_12 = VirtualPatriciaNode(bottom_node=leaf_hash_12, path=0, length=0, height=0)
    leaf_30 = VirtualPatriciaNode(bottom_node=leaf_hash_30, path=0, length=0, height=0)

    # Build left subtree and write its fact to DB.
    await EdgeNodeFact(bottom_node=leaf_hash_12, edge_path=1, edge_length=1).set_fact(ffc=ffc)
    left_tree_1 = VirtualPatriciaNode(bottom_node=leaf_hash_12, path=1, length=1, height=1)
    # Get children on both forms.
    expected_children = (empty_tree_0, leaf_12)
    assert await left_tree_1.get_children(ffc=ffc) == expected_children
    non_canonical_node = await make_virtual_edge_non_canonical(ffc=ffc, node=left_tree_1)
    assert await non_canonical_node.get_children(ffc=ffc) == expected_children

    # Combine left edge node and right empty tree. Write the result's fact to DB.
    await EdgeNodeFact(bottom_node=leaf_hash_12, edge_path=0b01, edge_length=2).set_fact(ffc=ffc)
    left_tree_2 = VirtualPatriciaNode(bottom_node=leaf_hash_12, path=0b01, length=2, height=2)
    # Get children on both forms.
    expected_children = (left_tree_1, empty_tree_1)
    assert await left_tree_2.get_children(ffc=ffc) == expected_children
    non_canonical_node = await make_virtual_edge_non_canonical(ffc=ffc, node=left_tree_2)
    assert await non_canonical_node.get_children(ffc=ffc) == expected_children

    # Build right subtree.
    # Combine left leaf and right empty tree. Write the result's fact to DB.
    await EdgeNodeFact(bottom_node=leaf_hash_30, edge_path=0, edge_length=1).set_fact(ffc=ffc)
    right_tree_1 = VirtualPatriciaNode(bottom_node=leaf_hash_30, path=0, length=1, height=1)
    # Get children on both forms.
    expected_children = (leaf_30, empty_tree_0)
    assert await right_tree_1.get_children(ffc=ffc) == expected_children
    non_canonical_node = await make_virtual_edge_non_canonical(ffc=ffc, node=right_tree_1)
    assert await non_canonical_node.get_children(ffc=ffc) == expected_children

    # Combine left empty tree and right edge node. Write the result's fact to DB.
    await EdgeNodeFact(bottom_node=leaf_hash_30, edge_path=0b10, edge_length=2).set_fact(ffc=ffc)
    right_tree_2 = VirtualPatriciaNode(bottom_node=leaf_hash_30, path=0b10, length=2, height=2)
    # Get children on both forms.
    expected_children = (empty_tree_1, right_tree_1)
    assert await right_tree_2.get_children(ffc=ffc) == expected_children
    non_canonical_node = await make_virtual_edge_non_canonical(ffc=ffc, node=right_tree_2)
    assert await non_canonical_node.get_children(ffc=ffc) == expected_children

    # Build whole tree and write its fact to DB.
    left_node, right_node = await asyncio.gather(
        *(node.commit(ffc=ffc, facts=None) for node in (left_tree_2, right_tree_2))
    )
    root_hash = await BinaryNodeFact(left_node=left_node, right_node=right_node).set_fact(ffc=ffc)

    tree = VirtualPatriciaNode(bottom_node=root_hash, path=0, length=0, height=3)
    left_edge_child, right_edge_child = await tree.get_children(ffc=ffc)
    assert (left_edge_child, right_edge_child) == (
        VirtualPatriciaNode(bottom_node=left_node, path=0, length=0, height=2),
        VirtualPatriciaNode(bottom_node=right_node, path=0, length=0, height=2),
    )

    # Test operations on the committed left tree.
    # Getting its children should return another edge with length shorter-by-one.
    assert await left_edge_child.get_children(ffc=ffc) == (left_tree_1, empty_tree_1)


@pytest.mark.asyncio
async def test_update_and_get_leaves(ffc: FactFetchingContext):
    """
    Builds a Patricia tree of length 3 with the following values in the leaves: 1 -> 12, 6 -> 30.
    This is the same tree as in the test above, but in this test built using _update().
    """
    # Build empty tree.
    tree = await build_empty_patricia_virtual_node(ffc=ffc, height=3)

    # Compare empty root to test util result.
    leaves_range = range(8)
    verify_root(leaves=[0 for _ in leaves_range], expected_root_hash=tree.bottom_node)

    # Update leaf values.
    leaves = {
        1: SimpleLeafFact(value=12),
        4: SimpleLeafFact(value=1000),
        6: SimpleLeafFact(value=30),
    }
    tree = await update_tree(
        tree=tree,
        ffc=ffc,
        modifications=leaves.items(),
        calculation_node_cls=VirtualCalculationNode,
    )

    # Check get_leaves().
    expected_leaves = {
        leaf_id: leaves[leaf_id] if leaf_id in leaves else SimpleLeafFact.empty()
        for leaf_id in leaves_range
    }
    await sample_and_verify_leaf_values(ffc=ffc, tree=tree, expected_leaves=expected_leaves)

    # Compare to test util result.
    verify_root(
        leaves=[leaf.value for leaf in expected_leaves.values()],
        expected_root_hash=tree.bottom_node,
    )

    # Update leaf values again: new leaves contain addition, deletion and updating a key.
    updated_leaves = {
        0: SimpleLeafFact(value=2),
        1: SimpleLeafFact(value=20),
        3: SimpleLeafFact(value=6),
        6: SimpleLeafFact.empty(),
    }
    tree = await update_tree(
        tree=tree,
        ffc=ffc,
        modifications=updated_leaves.items(),
        calculation_node_cls=VirtualCalculationNode,
    )

    # Check get_leaves().
    updated_leaves = {**expected_leaves, **updated_leaves}
    await sample_and_verify_leaf_values(ffc=ffc, tree=tree, expected_leaves=updated_leaves)

    # Compare to test util result.
    sorted_by_index_leaf_values = [updated_leaves[leaf_id].value for leaf_id in leaves_range]
    expected_root_hash = await tree.commit(ffc=ffc, facts=None)  # Root is an edge node.
    verify_root(leaves=sorted_by_index_leaf_values, expected_root_hash=expected_root_hash)


@pytest.mark.asyncio
async def test_binary_fact_tree_node_create_diff(ffc: FactFetchingContext):
    # All tree values ​​are zero.
    empty_tree = await PatriciaTree.empty_tree(
        ffc=ffc, height=251, leaf_fact=SimpleLeafFact.empty()
    )
    virtual_empty_tree_node = VirtualPatriciaNode.from_hash(
        hash_value=empty_tree.root, height=empty_tree.height
    )

    # All tree values ​​are zero except for the fifth leaf, which has a value of 8.
    one_change_tree = await empty_tree.update(ffc=ffc, modifications=[(5, SimpleLeafFact(value=8))])
    virtual_one_change_node = VirtualPatriciaNode.from_hash(
        hash_value=one_change_tree.root, height=empty_tree.height
    )

    # All tree values ​​are zero except for the fifth leaf, which has a value of 8.
    # and the 58th leaf, which is 81.
    two_change_tree = await one_change_tree.update(
        ffc=ffc, modifications=[(58, SimpleLeafFact(value=81))]
    )
    virtual_two_change_node = VirtualPatriciaNode.from_hash(
        hash_value=two_change_tree.root, height=empty_tree.height
    )

    # The difference between the tree whose values are all zero and the tree that has
    # all values zero except two values is exactly the 2 values.
    diff_result = await virtual_empty_tree_node.get_diff_between_trees(
        other=virtual_two_change_node, ffc=ffc, fact_cls=SimpleLeafFact
    )
    assert diff_result == [
        (5, SimpleLeafFact.empty(), SimpleLeafFact(value=8)),
        (58, SimpleLeafFact.empty(), SimpleLeafFact(value=81)),
    ]

    # The difference between the tree whose values are zero except for the fifth leaf
    # and the tree whose values are all zero except for the fifth leaf (there they are equal)
    # and for the 58th leaf is exactly the 58th leaf.
    diff_result = await virtual_one_change_node.get_diff_between_trees(
        other=virtual_two_change_node, ffc=ffc, fact_cls=SimpleLeafFact
    )
    assert diff_result == [(58, SimpleLeafFact.empty(), SimpleLeafFact(value=81))]


@random_test()
@pytest.mark.asyncio
async def test_get_leaves(seed: int, ffc: FactFetchingContext):
    # Build random tree.
    height = 100
    n_leaves = random.randint(1, 5) * 100
    leaf_values = random.choices(range(1, 1000), k=n_leaves)
    leaf_indices = [random.getrandbits(height) for _ in range(n_leaves)]
    leaves = dict(safe_zip(leaf_indices, (SimpleLeafFact(value=value) for value in leaf_values)))
    tree = await build_patricia_virtual_node(ffc=ffc, height=height, leaves=leaves)

    # Sample random subset of initialized leaves.
    n_sampled_leaves = random.randint(1, n_leaves)
    sampled_indices = random.sample(leaf_indices, k=n_sampled_leaves)
    await sample_and_verify_leaf_values(
        ffc=ffc,
        tree=tree,
        expected_leaves={index: leaf for index, leaf in leaves.items() if index in sampled_indices},
    )

    # Sample random subset of empty leaves (almost zero prob. they will land on initialize ones).
    empty_leaf = SimpleLeafFact.empty()
    sampled_indices = [random.getrandbits(height) for _ in range(10)]
    await sample_and_verify_leaf_values(
        ffc=ffc, tree=tree, expected_leaves={index: empty_leaf for index in sampled_indices}
    )
