import base64
import gzip
import json
from typing import Set

from services.external_api.client import JsonObject
from starkware.starknet.definitions import constants
from starkware.starknet.definitions.error_codes import StarknetErrorCode
from starkware.starknet.definitions.transaction_type import TransactionType
from starkware.starkware_utils.error_handling import wrap_with_stark_exception
from starkware.starkware_utils.validated_dataclass import rename_old_field_in_pre_load

# The following transaction types will only be supported from a certain version after regenesis.
DEPRECATED_TX_TYPES_FOR_SCHEMA: Set[str] = {
    TransactionType.DECLARE.name,
    TransactionType.DEPLOY_ACCOUNT.name,
    TransactionType.INVOKE_FUNCTION.name,
}


def is_deprecated_tx(raw_tx_type: str, version: int) -> bool:
    """
    Returns whether the given parameters represent a deprecated transaction.
    """
    is_deprecated_external_version = version < 3
    is_deprecated_simulation_version = (
        constants.QUERY_VERSION_BASE <= version < constants.QUERY_VERSION_BASE + 3
    )
    is_version_deprecated = is_deprecated_external_version or is_deprecated_simulation_version

    return raw_tx_type in DEPRECATED_TX_TYPES_FOR_SCHEMA and is_version_deprecated


def compress_program(program_json: JsonObject) -> str:
    full_program = json.dumps(program_json)
    compressed_program = gzip.compress(data=full_program.encode("ascii"))
    compressed_program = base64.b64encode(compressed_program)

    return compressed_program.decode("ascii")


def compress_program_post_dump(data: JsonObject, program_attr_name: str) -> JsonObject:
    contract_attr_name = (
        "contract_definition" if "contract_definition" in data else "contract_class"
    )

    data[contract_attr_name][program_attr_name] = compress_program(
        program_json=data[contract_attr_name][program_attr_name]
    )

    return data


def decompress_program(compressed_program: str) -> JsonObject:
    with wrap_with_stark_exception(
        code=StarknetErrorCode.INVALID_PROGRAM,
        message="Invalid compressed program.",
        exception_types=[Exception],
    ):
        compressed_program_bytes = base64.b64decode(compressed_program.encode("ascii"))
        decompressed_program = gzip.decompress(data=compressed_program_bytes)
        return json.loads(decompressed_program.decode("ascii"))


def decompress_program_pre_load(data: JsonObject, program_attr_name: str) -> JsonObject:
    contract_attr_name = (
        "contract_definition" if "contract_definition" in data else "contract_class"
    )

    data[contract_attr_name][program_attr_name] = decompress_program(
        data[contract_attr_name][program_attr_name]
    )

    return data


def rename_contract_address_to_sender_address_pre_load(data: JsonObject) -> JsonObject:
    return rename_old_field_in_pre_load(
        data=data, old_field_name="contract_address", new_field_name="sender_address"
    )
