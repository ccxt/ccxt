# pylint: disable=unused-variable
import pytest

from contract import Contract


@pytest.mark.asyncio
async def test_call_raw(map_contract: Contract):
    prepared_function_call = map_contract.functions["get"].prepare_call(key=10)
    # docs-start: call_raw
    raw_response = await prepared_function_call.call_raw(block_number="latest")
    # or
    raw_response = await prepared_function_call.call_raw()
    # docs-end: call_raw


@pytest.mark.asyncio
async def test_call(map_contract: Contract):
    prepared_function_call = map_contract.functions["get"].prepare_call(key=10)
    # docs-start: call
    response = await prepared_function_call.call(block_number="latest")
    # or
    response = await prepared_function_call.call()
    # docs-end: call
