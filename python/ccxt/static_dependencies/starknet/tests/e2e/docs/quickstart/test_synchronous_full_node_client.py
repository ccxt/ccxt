from net.full_node_client import FullNodeClient


def test_synchronous_full_node_client(
    client,
    map_contract_declare_hash,  # pylint: disable=unused-argument
):
    # pylint: disable=unused-variable
    fixture_client = client

    # docs: start
    node_url = "https://your.node.url"
    client = FullNodeClient(node_url=node_url)
    # docs: end

    client = fixture_client

    # docs: start
    call_result = client.get_block_sync(block_number=1)
    # docs: end
