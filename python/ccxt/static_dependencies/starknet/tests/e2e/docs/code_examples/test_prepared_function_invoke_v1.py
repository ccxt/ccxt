# pylint: disable=unused-variable
import pytest

from contract import Contract


@pytest.mark.asyncio
async def test_invoke(map_contract: Contract):
    prepared_function_call = map_contract.functions["put"].prepare_invoke_v1(
        key=10, value=20
    )
    # docs-start: invoke
    invoke_result = await prepared_function_call.invoke(max_fee=int(1e15))
    # docs-end: invoke
    prepared_function_call.max_fee = None
    # docs-start: invoke
    # max_fee can be estimated automatically
    invoke_result = await prepared_function_call.invoke(auto_estimate=True)
    # or if max_fee was specified in prepared_function_call
    # docs-end: invoke
    prepared_function_call.max_fee = int(1e15)
    # docs-start: invoke
    invoke_result = await prepared_function_call.invoke()
    # docs-end: invoke
