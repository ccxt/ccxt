import pytest


@pytest.mark.asyncio
async def test_handling_client_errors(account):
    # pylint: disable=import-outside-toplevel
    # docs: start
    from contract import Contract
    from net.client_errors import ClientError

    try:
        contract_address = "1"  # Doesn't exist
        await Contract.from_address(address=contract_address, provider=account)
    except ClientError as error:
        print(error.code, error.message)
    # docs: end
