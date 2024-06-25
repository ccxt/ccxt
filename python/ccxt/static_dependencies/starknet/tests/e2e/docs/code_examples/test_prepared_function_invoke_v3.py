# pylint: disable=unused-variable
import pytest

from contract import Contract
from net.client_models import ResourceBounds


@pytest.mark.asyncio
async def test_invoke(map_contract: Contract):
    prepared_function_call = map_contract.functions["put"].prepare_invoke_v3(
        key=10, value=20
    )
    l1_resource_bounds = ResourceBounds(max_amount=5000, max_price_per_unit=int(1e12))
    # docs-start: invoke
    invoke_result = await prepared_function_call.invoke(
        l1_resource_bounds=ResourceBounds(max_amount=5000, max_price_per_unit=int(1e12))
    )
    # docs-end: invoke
    prepared_function_call.l1_resource_bounds = None
    # docs-start: invoke
    # l1_resource_bounds can be estimated automatically
    invoke_result = await prepared_function_call.invoke(auto_estimate=True)
    # or if l1_resource_bounds was specified in prepared_function_call
    # docs-end: invoke
    prepared_function_call.l1_resource_bounds = l1_resource_bounds
    # docs-start: invoke
    invoke_result = await prepared_function_call.invoke()
    # docs-end: invoke
