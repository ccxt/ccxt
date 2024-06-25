import copy
import json
import re
from typing import List

from cairo.felt import encode_shortstring
from constants import API_VERSION
from hash.utils import _starknet_keccak, compute_hash_on_elements
from net.client_models import ContractClass, EntryPoint


def compute_class_hash(contract_class: ContractClass) -> int:
    """
    Calculate class hash of a ContractClass.
    """
    api_version = API_VERSION

    _entry_points = contract_class.entry_points_by_type

    external_entry_points_hash = compute_hash_on_elements(
        _entry_points_array(_entry_points.external)
    )
    l1_handler_entry_points_hash = compute_hash_on_elements(
        _entry_points_array(_entry_points.l1_handler)
    )
    constructor_entry_points_hash = compute_hash_on_elements(
        _entry_points_array(_entry_points.constructor)
    )

    _encoded_builtins = [
        encode_shortstring(builtin) for builtin in contract_class.program["builtins"]
    ]
    builtins_hash = compute_hash_on_elements(_encoded_builtins)

    hinted_class_hash = _compute_hinted_class_hash(copy.deepcopy(contract_class))

    program_data_hash = compute_hash_on_elements(
        [int(data_, 0) for data_ in contract_class.program["data"]]
    )

    return compute_hash_on_elements(
        [
            api_version,
            external_entry_points_hash,
            l1_handler_entry_points_hash,
            constructor_entry_points_hash,
            builtins_hash,
            hinted_class_hash,
            program_data_hash,
        ]
    )


def _entry_points_array(entry_points: List[EntryPoint]) -> List[int]:
    entry_points_array = []
    for entry_point in entry_points:
        entry_points_array.extend([entry_point.selector, entry_point.offset])

    return entry_points_array


def _compute_hinted_class_hash(contract_class: ContractClass) -> int:
    program = contract_class.program
    program["debug_info"] = None

    if "attributes" in program:
        program = _delete_backward_compatibility_fields(program)

    # If compiler_version is not present, this was compiled with a compiler before version 0.10.0.
    # Use "(a : felt)" syntax instead of "(a: felt)" so that the class hash will be the same.
    if "compiler_version" not in program:
        program["identifiers"] = _fix_cairo_types(program["identifiers"])

    class_ = {"abi": contract_class.abi, "program": program}
    serialized_contract_class = json.dumps(obj=class_)
    return _starknet_keccak(data=serialized_contract_class.encode())


def _fix_cairo_types(identifiers: dict) -> dict:
    """
    Recursively goes through identifiers looking for "cairo_type" fields.
    Pads values with a space before the colon between variable and type.
    Example:
        (retdata_size: felt, retdata: felt*) => (retdata_size : felt, retdata : felt*)
    """
    for name, value in identifiers.items():
        if not isinstance(value, dict):
            continue

        if "cairo_type" in value:
            value["cairo_type"] = _add_backward_compatibility_space(value["cairo_type"])

        identifiers[name] = _fix_cairo_types(value)

    return identifiers


def _add_backward_compatibility_space(cairo_type: str) -> str:
    return re.sub(r"(?<! ):", " :", cairo_type)


def _delete_backward_compatibility_fields(program) -> dict:
    if len(program["attributes"]) == 0:
        # Remove attributes field from raw dictionary, for hash backward compatibility of
        # contracts deployed prior to adding this feature.
        del program["attributes"]
        return program

    # Remove accessible_scopes and flow_tracking_data fields from raw dictionary, for hash
    # backward compatibility of contracts deployed prior to adding this feature.
    for attr in program["attributes"]:
        if "accessible_scopes" in attr and len(attr["accessible_scopes"]) == 0:
            del attr["accessible_scopes"]
        if "flow_tracking_data" in attr and attr["flow_tracking_data"] is None:
            del attr["flow_tracking_data"]
    return program
