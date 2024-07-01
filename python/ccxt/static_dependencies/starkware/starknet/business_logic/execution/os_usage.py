import functools
import json
import os.path
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, Mapping

import marshmallow_dataclass

from starkware.cairo.lang.vm.cairo_pie import ExecutionResources
from starkware.python.utils import snake_to_camel_case
from starkware.starknet.definitions.transaction_type import TransactionType
from starkware.starkware_utils.validated_dataclass import ValidatedMarshmallowDataclass

DIR = os.path.dirname(__file__)


@marshmallow_dataclass.dataclass(frozen=True)
class ResourcesParams(ValidatedMarshmallowDataclass):
    constant: ExecutionResources
    calldata_factor: ExecutionResources


@marshmallow_dataclass.dataclass(frozen=True)
class OsResources(ValidatedMarshmallowDataclass):
    # Mapping from every syscall to its execution resources in the OS (e.g., amount of Cairo steps).
    execute_syscalls: Mapping[str, ExecutionResources]
    # Mapping from every transaction to its extra execution resources in the OS,
    # i.e., resources that don't count during the execution itself.
    execute_txs_inner: Mapping[TransactionType, ResourcesParams]

    def into_blockifier_json_object(self) -> Dict[str, Any]:
        """
        Converts the object to a JSON object suitable for the blockifier by transforming all keys
        from Python's snake_case to Rust-style CamelCase and excluding the unsupported DEPLOY
        transaction types.
        """

        os_resources_json_object = self.dump()
        del os_resources_json_object["execute_txs_inner"][TransactionType.DEPLOY.name]

        # Convert inner keys to CamelCase.

        # SCREAMING_SNAKE_CASE / snake_case -> CamelCase.
        for inner_dict_key in ("execute_syscalls", "execute_txs_inner"):
            transformed_values = {
                snake_to_camel_case(k.lower()): v
                for k, v in os_resources_json_object[inner_dict_key].items()
            }
            sorted_values = dict(sorted(transformed_values.items()))
            os_resources_json_object[inner_dict_key] = sorted_values

        return os_resources_json_object


@lru_cache()
def get_os_resources() -> OsResources:
    # Empirical costs; accounted during transaction execution.
    constants = json.loads(
        Path(DIR).parent.parent.joinpath("definitions/versioned_constants.json").open().read()
    )

    return OsResources.load(data=constants["os_resources"])


def get_tx_additional_os_resources(
    syscall_counter: Mapping[str, int], tx_type: TransactionType
) -> ExecutionResources:
    os_resources = get_os_resources()
    # Calculate the additional resources needed for the OS to run the given syscalls;
    # i.e., the resources of the function execute_syscalls().
    os_additional_resources = functools.reduce(
        ExecutionResources.__add__,
        (
            os_resources.execute_syscalls[syscall_name] * syscall_counter[syscall_name]
            for syscall_name in syscall_counter.keys()
        ),
        ExecutionResources.empty(),
    )

    # Calculate the additional resources needed for the OS to run the given transaction;
    # i.e., the resources of the StarkNet OS function execute_transactions_inner().
    return os_additional_resources + os_resources.execute_txs_inner[tx_type].constant
