from typing import Optional, Union

import pytest

from net.client_models import Call, Hash, Tag


@pytest.mark.asyncio
async def test_custom_nonce(account):
    # pylint: disable=import-outside-toplevel
    client = account.client
    address = account.address
    private_key = account.signer.key_pair.private_key

    # docs: start
    from net.account.account import Account
    from net.client import Client
    from net.models import AddressRepresentation, StarknetChainId
    from net.signer import BaseSigner
    from net.signer.stark_curve_signer import KeyPair

    class MyAccount(Account):
        def __init__(
            self,
            *,
            address: AddressRepresentation,
            client: Client,
            signer: Optional[BaseSigner] = None,
            key_pair: Optional[KeyPair] = None,
            chain: Optional[StarknetChainId] = None,
        ):
            super().__init__(
                address=address,
                client=client,
                signer=signer,
                key_pair=key_pair,
                chain=chain,
            )
            # Create a simple counter that will store a nonce
            self.nonce_counter = 0

        async def get_nonce(
            self,
            *,
            block_hash: Optional[Union[Hash, Tag]] = None,
            block_number: Optional[Union[int, Tag]] = None,
        ) -> int:
            # Increment the counter and return the nonce.
            # This is just an example custom nonce logic and is not meant
            # to be a recommended solution.
            nonce = self.nonce_counter
            self.nonce_counter += 1
            return nonce

    account = MyAccount(
        address=address,
        client=client,
        key_pair=KeyPair.from_private_key(private_key),
        chain=StarknetChainId.SEPOLIA,
    )
    # docs: end

    assert account.nonce_counter == 0
    await account.sign_invoke_v1(calls=Call(0x1, 0x1, []), max_fee=10000000000)
    assert account.nonce_counter == 1
