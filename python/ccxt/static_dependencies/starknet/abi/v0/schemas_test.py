import json

from ..marshmallow import EXCLUDE

from abi.v0.schemas import ContractAbiEntrySchema
from tests.e2e.fixtures.constants import CONTRACTS_COMPILED_V0_DIR
from tests.e2e.fixtures.misc import read_contract


def test_deserialize_abi():
    abi = json.loads(
        read_contract(
            "balance_struct_event_abi.json", directory=CONTRACTS_COMPILED_V0_DIR
        )
    )
    deserialized = [
        ContractAbiEntrySchema().load(entry, unknown=EXCLUDE) for entry in abi
    ]

    assert len(deserialized) == len(abi)
