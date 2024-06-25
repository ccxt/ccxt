import pytest

from net.signer.stark_curve_signer import StarkCurveSigner


@pytest.mark.asyncio
async def test_creating_account():
    # pylint: disable=import-outside-toplevel, unused-variable
    # docs: start
    from net.account.account import Account
    from net.full_node_client import FullNodeClient
    from net.models.chains import StarknetChainId
    from net.signer.stark_curve_signer import KeyPair

    # Creates an instance of account which is already deployed
    # Account using transaction version=1 (has __validate__ function)
    client = FullNodeClient(node_url="your.node.url")
    account = Account(
        client=client,
        address="0x4321",
        key_pair=KeyPair(private_key=654, public_key=321),
        chain=StarknetChainId.SEPOLIA,
    )

    # There is another way of creating key_pair
    key_pair = KeyPair.from_private_key(key=123)
    # or
    key_pair = KeyPair.from_private_key(key="0x123")

    # Instead of providing key_pair it is possible to specify a signer
    signer = StarkCurveSigner("0x1234", key_pair, StarknetChainId.SEPOLIA)

    account = Account(
        client=client, address="0x1234", signer=signer, chain=StarknetChainId.SEPOLIA
    )
    # docs: end
