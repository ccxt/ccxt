import pytest

from net.client_models import StarknetBlock, Transaction


@pytest.mark.run_on_devnet
@pytest.mark.asyncio
async def test_using_full_node_client(client, map_contract):
    # pylint: disable=import-outside-toplevel, unused-variable
    full_node_client_fixture = client

    # docs: start
    from net.full_node_client import FullNodeClient

    node_url = "https://your.node.url"
    client = FullNodeClient(node_url=node_url)
    # docs: end

    await map_contract.functions["put"].prepare_invoke_v1(key=10, value=10).invoke(
        max_fee=int(1e20)
    )

    client = full_node_client_fixture
    # docs: start

    call_result = await client.get_block(block_number=1)
    # docs: end
    assert isinstance(call_result, StarknetBlock)
    assert len(call_result.transactions) == 1
    assert isinstance(call_result.transactions[0], Transaction)
    assert call_result.block_hash
