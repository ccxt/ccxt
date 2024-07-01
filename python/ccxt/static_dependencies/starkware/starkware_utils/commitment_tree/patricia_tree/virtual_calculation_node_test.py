import random

import pytest
import pytest_asyncio

from starkware.starkware_utils.commitment_tree.calculation import ConstantCalculation
from starkware.starkware_utils.commitment_tree.patricia_tree.virtual_calculation_node import (
    BinaryCalculation,
    EdgeCalculation,
    VirtualCalculationNode,
)
from starkware.storage.storage import FactFetchingContext
from starkware.storage.storage_utils import SimpleLeafFact
from starkware.storage.test_utils import MockStorage, hash_func


@pytest.fixture
def ffc() -> FactFetchingContext:
    return FactFetchingContext(storage=MockStorage(), hash_func=hash_func)


@pytest_asyncio.fixture
async def leaf_calculation(ffc: FactFetchingContext) -> ConstantCalculation:
    leaf_hash = await SimpleLeafFact(value=random.randrange(1, 100)).set_fact(ffc=ffc)
    return ConstantCalculation(leaf_hash)


@pytest_asyncio.fixture
async def leaf_calculation2(ffc: FactFetchingContext) -> ConstantCalculation:
    leaf_hash = await SimpleLeafFact(value=random.randrange(100, 200)).set_fact(ffc=ffc)
    return ConstantCalculation(leaf_hash)


def test_invalid_length(leaf_calculation: ConstantCalculation):
    with pytest.raises(AssertionError, match="Edge path must be at most of length 0; got: 0b1."):
        VirtualCalculationNode(bottom_calculation=leaf_calculation, path=1, length=0, height=1)


@pytest.mark.asyncio
@pytest.mark.parametrize("height", [0, 7])
async def test_combine_two_empty(ffc: FactFetchingContext, height: int):
    child = VirtualCalculationNode.empty_node(height=height)
    parent = await VirtualCalculationNode.combine(ffc=ffc, left=child, right=child, facts=None)
    assert parent == VirtualCalculationNode.empty_node(height=height + 1)


@pytest.mark.asyncio
async def test_combine_unmatching_height(ffc: FactFetchingContext):
    empty_node_0 = VirtualCalculationNode.empty_node(height=0)
    empty_node_1 = VirtualCalculationNode.empty_node(height=1)
    with pytest.raises(
        AssertionError, match="Only trees of same height can be combined; got: left=0 right=1."
    ):
        await VirtualCalculationNode.combine(
            ffc=ffc, left=empty_node_0, right=empty_node_1, facts=None
        )


@pytest.mark.asyncio
async def test_combine_left_empty_right_leaf(
    ffc: FactFetchingContext, leaf_calculation: ConstantCalculation
):
    left = VirtualCalculationNode.empty_node(height=0)
    right = VirtualCalculationNode(bottom_calculation=leaf_calculation, path=0, length=0, height=0)
    parent = await VirtualCalculationNode.combine(ffc=ffc, left=left, right=right, facts=None)
    assert parent == VirtualCalculationNode(
        bottom_calculation=leaf_calculation, path=1, length=1, height=1
    )


@pytest.mark.asyncio
async def test_combine_left_leaf_right_empty(
    ffc: FactFetchingContext, leaf_calculation: ConstantCalculation
):
    left = VirtualCalculationNode(bottom_calculation=leaf_calculation, path=0, length=0, height=0)
    right = VirtualCalculationNode.empty_node(height=0)
    parent = await VirtualCalculationNode.combine(ffc=ffc, left=left, right=right, facts=None)
    assert parent == VirtualCalculationNode(
        bottom_calculation=leaf_calculation, path=0, length=1, height=1
    )


@pytest.mark.asyncio
async def test_combine_left_empty_right_virtual_edge(
    ffc: FactFetchingContext, leaf_calculation: ConstantCalculation
):
    left = VirtualCalculationNode.empty_node(height=1)
    right = VirtualCalculationNode(bottom_calculation=leaf_calculation, path=0, length=1, height=1)
    parent = await VirtualCalculationNode.combine(ffc=ffc, left=left, right=right, facts=None)
    assert parent == VirtualCalculationNode(
        bottom_calculation=leaf_calculation, path=0b10, length=2, height=2
    )


@pytest.mark.asyncio
async def test_combine_left_virtual_edge_right_empty(
    ffc: FactFetchingContext, leaf_calculation: ConstantCalculation
):
    left = VirtualCalculationNode(bottom_calculation=leaf_calculation, path=1, length=1, height=1)
    right = VirtualCalculationNode.empty_node(height=1)
    parent = await VirtualCalculationNode.combine(ffc=ffc, left=left, right=right, facts=None)
    assert parent == VirtualCalculationNode(
        bottom_calculation=leaf_calculation, path=0b01, length=2, height=2
    )


@pytest.mark.asyncio
async def test_combine_two_virtual_edges(
    ffc: FactFetchingContext, leaf_calculation: ConstantCalculation, leaf_calculation2
):
    left = VirtualCalculationNode(bottom_calculation=leaf_calculation, path=1, length=1, height=1)
    right = VirtualCalculationNode(bottom_calculation=leaf_calculation2, path=0, length=1, height=1)
    parent = await VirtualCalculationNode.combine(ffc=ffc, left=left, right=right, facts=None)
    assert parent == VirtualCalculationNode(
        bottom_calculation=BinaryCalculation(
            left=EdgeCalculation(bottom=leaf_calculation, path=1, length=1),
            right=EdgeCalculation(bottom=leaf_calculation2, path=0, length=1),
        ),
        path=0,
        length=0,
        height=2,
    )
