import os
import re
from typing import Tuple

import pytest
import pytest_asyncio

from starkware.starknet.business_logic.execution.objects import Event
from starkware.starknet.core.test_contract.test_utils import get_deprecated_compiled_class
from starkware.starknet.public.abi import AbiType, get_selector_from_name
from starkware.starknet.testing.contract import DeclaredClass, StarknetContract
from starkware.starknet.testing.starknet import Starknet
from starkware.starknet.utils.api_utils import cast_to_felts

CONTRACT_FILE = os.path.join(os.path.dirname(__file__), "test.cairo")


# Fixtures.


@pytest_asyncio.fixture
async def starknet() -> Starknet:
    return await Starknet.empty()


@pytest_asyncio.fixture
async def test_contract(starknet: Starknet) -> StarknetContract:
    declare_info = await starknet.deprecated_declare(source=CONTRACT_FILE)
    return await starknet.deploy(class_hash=declare_info.class_hash, constructor_calldata=[])


@pytest_asyncio.fixture
async def test_class(starknet: Starknet) -> DeclaredClass:
    return await starknet.deprecated_declare(source=CONTRACT_FILE)


@pytest_asyncio.fixture
async def proxy_contract(starknet: Starknet) -> StarknetContract:
    contract_class = get_deprecated_compiled_class("delegate_proxy")
    declare_info = await starknet.deprecated_declare(contract_class=contract_class)
    return await starknet.deploy(constructor_calldata=[], class_hash=declare_info.class_hash)


@pytest_asyncio.fixture
async def account_contract(starknet: Starknet) -> StarknetContract:
    contract_class = get_deprecated_compiled_class("dummy_account")
    declare_info = await starknet.deprecated_declare(contract_class=contract_class)
    return await starknet.deploy(constructor_calldata=[], class_hash=declare_info.class_hash)


# Tests.


@pytest.mark.asyncio
async def test_function_call(test_contract: StarknetContract):
    await test_contract.increase_value(address=132, value=3).execute()
    await test_contract.increase_value(132, 5).execute()
    await test_contract.increase_value(132, 10).call()

    # Since the return type is a named tuple, the result can be checked in multiple ways.
    execution_info = await test_contract.get_value(address=132).execute()
    assert execution_info.result == (8,)
    execution_info = await test_contract.get_value(address=132).call()
    assert execution_info.result.res == 8  # Access by the name of the return value, `res`.
    execution_info = await test_contract.takes_array(a=[1, 2, 4]).execute()
    assert execution_info.result[0] == 6  # Access by location.

    # Check structs.
    point_1 = test_contract.Point(x=1, y=2)
    point_2 = test_contract.Point(x=3, y=4)
    execution_info = await test_contract.sum_points(points=(point_1, point_2)).execute()
    assert execution_info.result == ((4, 6),)
    execution_info = await test_contract.sum_points(((-1, 2), (-3, 4))).execute()
    assert execution_info.result.res == tuple(cast_to_felts(values=[-4, 6]))

    # Check multiple return values.
    execution_info = await test_contract.sum_and_mult_points(points=(point_1, point_2)).execute()
    assert execution_info.result == (test_contract.Point(x=4, y=6), 11)

    # Check struct type consistency.
    assert isinstance(execution_info.result.sum_res, test_contract.Point)

    # Check type annotatins.
    func_annotations = test_contract.sum_and_mult_points.__annotations__
    expected_annotations = {
        "points": Tuple[Tuple[int, int], Tuple[int, int]],
        "return": (Tuple[int, int], int),
    }
    assert func_annotations == expected_annotations

    # Check negative flows.
    with pytest.raises(
        TypeError, match=re.escape("argument points[1] has wrong number of elements")
    ):
        test_contract.sum_points(points=((1, 2), (3, 4, 5)))

    with pytest.raises(TypeError, match=re.escape("type of argument points[0][1] must be int")):
        test_contract.sum_points(points=((1, 2.5), (3, 4)))

    point = test_contract.Point(x="1", y=2)
    with pytest.raises(TypeError, match=re.escape("type of argument points[0][0] must be int")):
        test_contract.sum_points(points=(point, (1, 2)))

    with pytest.raises(TypeError, match=re.escape("sum_points() takes 1 positional argument")):
        test_contract.sum_points(1, 2, 3, 4)


@pytest.mark.asyncio
async def test_proxy_call(proxy_contract: StarknetContract, test_class: DeclaredClass):
    wrapped_contract = await wrap_with_proxy(
        proxy_contract=proxy_contract,
        impl_class_hash=test_class.class_hash,
        impl_class_abi=test_class.abi,
    )

    await wrapped_contract.increase_value(address=132, value=7).execute()

    execution_info = await wrapped_contract.get_value(address=132).execute()
    assert execution_info.result == (7,)


@pytest.mark.asyncio
async def test_raw_decorators(
    test_contract: StarknetContract,
    account_contract: StarknetContract,
    proxy_contract: StarknetContract,
):
    selector = get_selector_from_name("increase_value")
    await account_contract.__execute__(
        contract_address=test_contract.contract_address, selector=selector, calldata=[132, 41]
    ).execute()

    selector = get_selector_from_name("get_value")
    execution_info = await account_contract.__execute__(
        contract_address=test_contract.contract_address, selector=selector, calldata=[132]
    ).execute()
    assert execution_info.result == (41,)

    with pytest.raises(AssertionError, match="Direct raw_input function calls are not supported."):
        proxy_contract.__default__(selector=selector, calldata=[])


@pytest.mark.asyncio
async def test_event(test_contract: StarknetContract):
    p1 = test_contract.Point(x=1, y=2)
    p2 = test_contract.Point(x=3, y=4)
    point_sum = test_contract.Point(x=p1.x + p2.x, y=p1.y + p2.y)

    log_sum_points_tuple = test_contract.event_manager.get_contract_event(
        identifier="log_sum_points"
    )
    expected_event = log_sum_points_tuple(points=[p1, p2], sum=point_sum)

    execution_info = await test_contract.sum_points(points=(p1, p2)).execute()
    (actual_event,) = execution_info.main_call_events

    # Check high-level form.
    assert isinstance(actual_event, log_sum_points_tuple)
    assert actual_event == expected_event
    assert (actual_event.points, actual_event.sum) == ([p1, p2], point_sum)

    # Check low-level flat form (which includes the array length).
    (actual_raw_event,) = execution_info.raw_events
    assert actual_raw_event == Event(
        from_address=test_contract.contract_address,
        keys=[get_selector_from_name("log_sum_points")],
        data=[2, p1.x, p1.y, p2.x, p2.y, point_sum.x, point_sum.y],
    )

    # Check that the state's event list was updated.
    assert test_contract.state.events == [actual_raw_event]


# Utilities.


async def wrap_with_proxy(
    proxy_contract: StarknetContract,
    impl_class_hash: int,
    impl_class_abi: AbiType,
) -> StarknetContract:
    """
    Wraps an implementation contract's ABI with a proxy contract.
    """
    await proxy_contract.set_implementation_hash(implementation_hash_=impl_class_hash).execute()
    return proxy_contract.replace_abi(impl_contract_abi=impl_class_abi)
