import json

import pytest
from marshmallow import EXCLUDE

from abi.v2.schemas import ContractAbiEntrySchema
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
def test_deserialize_abi(contract_name):
    abi = json.loads(
        load_contract(contract_name, version=ContractVersion.V2)["sierra"]
    )["abi"]
    deserialized = [
        ContractAbiEntrySchema().load(entry, unknown=EXCLUDE) for entry in abi
    ]

    assert len(deserialized) == len(abi)
