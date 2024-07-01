import pytest

from starkware.python.utils import from_bytes, to_bytes
from starkware.starkware_utils.commitment_tree.patricia_tree.nodes import (
    BinaryNodeFact,
    EdgeNodeFact,
    EmptyNodeFact,
    get_node_type,
)
from starkware.storage.test_utils import hash_func


@pytest.mark.asyncio
async def test_binary_node():
    left_node = to_bytes(0x1234)
    right_node = to_bytes(0xABCD)
    binary_node = BinaryNodeFact(left_node=left_node, right_node=right_node)

    # Test node type.
    assert get_node_type(fact_preimage=binary_node.serialize()) is BinaryNodeFact

    # Test hash.
    assert binary_node._hash(hash_func=hash_func) == hash_func(left_node, right_node)

    # Test BinaryNodeFact failures.
    illegal_child_nodes = (EmptyNodeFact.EMPTY_NODE_HASH, to_bytes(0xA))
    for nodes in (illegal_child_nodes, illegal_child_nodes[::1]):
        left_node, right_node = nodes

        with pytest.raises(
            AssertionError,
            match="It is not allowed for any child of a binary node to be the empty node.",
        ):
            BinaryNodeFact(left_node=left_node, right_node=right_node)


@pytest.mark.asyncio
async def test_edge_node():
    edge_node = EdgeNodeFact(bottom_node=to_bytes(0x1234ABCD), edge_path=42, edge_length=6)

    # Test node type.
    assert get_node_type(fact_preimage=edge_node.serialize()) is EdgeNodeFact

    # Test hash.
    bottom_path_hash = hash_func(edge_node.bottom_node, to_bytes(edge_node.edge_path))
    hash_value = from_bytes(bottom_path_hash) + edge_node.edge_length
    assert edge_node._hash(hash_func=hash_func) == to_bytes(hash_value)


@pytest.mark.asyncio
async def test_empty_node():
    empty_node = EmptyNodeFact()

    # Test node type.
    assert get_node_type(fact_preimage=empty_node.serialize()) is EmptyNodeFact

    # Test hash.
    assert empty_node._hash(hash_func=hash_func) == EmptyNodeFact.EMPTY_NODE_HASH
