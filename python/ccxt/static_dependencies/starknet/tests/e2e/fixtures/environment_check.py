import pytest

from abi.v0 import AbiParser
from constants import DEFAULT_DEPLOYER_ADDRESS
from net.udc_deployer.deployer import _deployer_abi


@pytest.fixture(scope="package", autouse=True)
async def check_if_udc_is_deployed(client):
    class_hash = await client.get_class_hash_at(
        contract_address=DEFAULT_DEPLOYER_ADDRESS
    )

    assert isinstance(class_hash, int)
    assert class_hash != 0


@pytest.fixture(scope="package", autouse=True)
async def check_if_udc_has_expected_abi(gateway_client):
    code = await gateway_client.get_code(contract_address=DEFAULT_DEPLOYER_ADDRESS)

    assert AbiParser(code.abi).parse() == _deployer_abi
