import json

import pytest

from abi.v2 import Abi, AbiParser
from tests.e2e.fixtures.misc import ContractVersion, load_contract


@pytest.mark.parametrize(
    "contract_name",
    [
        "AbiTypes",
        "Account",
        "ERC20",
        "Hello2",
        "HelloStarknet",
        "MinimalContract",
        "NewSyntaxTestContract",
        "TestContract",
        "TestEnum",
        "TestOption",
        "TokenBridge",
    ],
)
def test_abi_parse(contract_name):
    abi = json.loads(
        load_contract(contract_name=contract_name, version=ContractVersion.V2)["sierra"]
    )["abi"]

    parser = AbiParser(abi)
    parsed_abi = parser.parse()

    assert isinstance(parsed_abi, Abi)
