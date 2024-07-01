import dataclasses
from dataclasses import field
from enum import Enum
from typing import Any, Dict, Mapping, Optional, Type

import marshmallow
import marshmallow.fields as mfields
import marshmallow.utils
import marshmallow_dataclass

from services.everest.definitions import fields as everest_fields
from starkware.cairo.lang.tracer.tracer_data import field_element_repr
from starkware.python.utils import from_bytes
from starkware.starknet.definitions import constants
from starkware.starknet.definitions.data_availability_mode import DataAvailabilityMode
from starkware.starknet.definitions.error_codes import StarknetErrorCode
from starkware.starknet.definitions.execution_mode import ExecutionMode
from starkware.starknet.definitions.l1_da_mode import L1DaMode
from starkware.starknet.definitions.transaction_type import TransactionType
from starkware.starkware_utils.field_validators import (
    validate_equal,
    validate_max_length,
    validate_non_negative,
    validate_positive,
)
from starkware.starkware_utils.marshmallow_dataclass_fields import (
    BackwardCompatibleIntAsHex,
    BytesAsHex,
    EnumField,
    FrozenDictField,
    StrictRequiredInteger,
    VariadicLengthTupleField,
)
from starkware.starkware_utils.marshmallow_fields_metadata import sequential_id_metadata
from starkware.starkware_utils.validated_dataclass import ValidatedMarshmallowDataclass
from starkware.starkware_utils.validated_fields import OptionalField, RangeValidatedField

# Fields data: validation data, dataclass metadata.


# Common.


def create_felt_as_hex_bounded_list_metadata(
    required: bool = True,
    list_max_length: int = constants.SIERRA_ARRAY_LEN_BOUND - 1,
) -> Dict[str, Any]:
    return dict(
        marshmallow_field=mfields.List(
            everest_fields.FeltField.get_marshmallow_field(),
            required=required,
            validate=validate_max_length(field_name="felt_list", max_length=list_max_length),
        )
    )


felt_as_hex_bounded_list_metadata = create_felt_as_hex_bounded_list_metadata()
felt_as_hex_bounded_list_metadata_empty_list = create_felt_as_hex_bounded_list_metadata(
    list_max_length=0
)


felt_as_hex_or_str_list_metadata = dict(
    marshmallow_field=mfields.List(
        BackwardCompatibleIntAsHex(
            allow_decimal_loading=True, validate=everest_fields.FeltField.validate
        )
    )
)

felt_as_hex_or_str_bounded_list_metadata = dict(
    marshmallow_field=mfields.List(
        BackwardCompatibleIntAsHex(
            allow_decimal_loading=True, validate=everest_fields.FeltField.validate
        ),
        validate=validate_max_length(
            field_name="felt_list", max_length=constants.SIERRA_ARRAY_LEN_BOUND - 1
        ),
    )
)


def felt_formatter(hex_felt: str) -> str:
    return field_element_repr(val=int(hex_felt, 16), prime=everest_fields.FeltField.upper_bound)


def felt_formatter_from_int(int_felt: int) -> str:
    return field_element_repr(val=int_felt, prime=everest_fields.FeltField.upper_bound)


def new_class_hash_dict_keys_metadata(
    values_schema: Type[marshmallow.Schema],
) -> Dict[str, mfields.Dict]:
    return dict(
        marshmallow_field=mfields.Dict(
            keys=NewClassHashField,
            values=mfields.Nested(values_schema),
        )
    )


timestamp_metadata = dict(
    marshmallow_field=StrictRequiredInteger(validate=validate_non_negative("timestamp"))
)

calldata_metadata = felt_as_hex_or_str_bounded_list_metadata
deprecated_signature_metadata = felt_as_hex_or_str_bounded_list_metadata
signature_metadata = felt_as_hex_bounded_list_metadata
calldata_as_hex_metadata = felt_as_hex_bounded_list_metadata
retdata_as_hex_metadata = everest_fields.felt_as_hex_list_metadata


# Address.

AddressField = RangeValidatedField(
    lower_bound=constants.ADDRESS_LOWER_BOUND,
    upper_bound=constants.ADDRESS_UPPER_BOUND,
    name="Address",
    error_code=StarknetErrorCode.OUT_OF_RANGE_ADDRESS,
    formatter=hex,
)


def address_metadata(name: str, error_code: StarknetErrorCode) -> Dict[str, Any]:
    return dataclasses.replace(AddressField, name=name, error_code=error_code).metadata()


sequencer_address_metadata = address_metadata(
    name="Sequencer address", error_code=StarknetErrorCode.OUT_OF_RANGE_SEQUENCER_ADDRESS
)

OptionalSequencerAddressField = OptionalField(
    field=dataclasses.replace(
        AddressField,
        name="Sequencer address",
        error_code=StarknetErrorCode.OUT_OF_RANGE_SEQUENCER_ADDRESS,
    ),
    none_probability=0,
)
optional_sequencer_address_metadata = OptionalSequencerAddressField.metadata()

starknet_version_metadata = dict(
    marshmallow_field=mfields.String(required=False, load_default=None)
)

use_kzg_da_metadata = dict(marshmallow_field=mfields.Boolean(required=False, load_default=False))

caller_address_metadata = address_metadata(
    name="Caller address", error_code=StarknetErrorCode.OUT_OF_RANGE_CALLER_ADDRESS
)

fee_token_address_metadata = address_metadata(
    name="Fee token address", error_code=StarknetErrorCode.OUT_OF_RANGE_CONTRACT_ADDRESS
)


# Nonce.

NonceField = RangeValidatedField(
    lower_bound=constants.NONCE_LOWER_BOUND,
    upper_bound=constants.NONCE_UPPER_BOUND,
    name="Nonce",
    error_code=StarknetErrorCode.OUT_OF_RANGE_NONCE,
    formatter=hex,
)
nonce_metadata = NonceField.metadata()

OptionalNonceField = OptionalField(field=NonceField, none_probability=0)
optional_nonce_metadata = OptionalNonceField.metadata()

non_required_nonce_metadata = NonceField.metadata(required=False, load_default=0)


# Paymaster data.

paymaster_data_metadata = felt_as_hex_bounded_list_metadata_empty_list

# Block.

block_number_metadata = sequential_id_metadata(field_name="Block number", allow_previous_id=True)
default_optional_block_number_metadata = sequential_id_metadata(
    field_name="Block number", required=False, load_default=None
)

BlockHashField = RangeValidatedField(
    lower_bound=0,
    upper_bound=constants.BLOCK_HASH_UPPER_BOUND,
    name="Block hash",
    error_code=StarknetErrorCode.OUT_OF_RANGE_BLOCK_HASH,
    formatter=hex,
)
block_hash_metadata = BlockHashField.metadata()

OptionalBlockHashField = OptionalField(field=BlockHashField, none_probability=0)
optional_block_hash_metadata = OptionalBlockHashField.metadata()

CommitmentField = RangeValidatedField(
    lower_bound=constants.COMMITMENT_LOWER_BOUND,
    upper_bound=constants.COMMITMENT_UPPER_BOUND,
    name="Commitment",
    error_code=StarknetErrorCode.OUT_OF_RANGE_BLOCK_HASH,
    formatter=hex,
)
commitment_metadata = CommitmentField.metadata()

OptionalCommitmentField = OptionalField(field=CommitmentField, none_probability=0)
optional_commitment_metadata = OptionalCommitmentField.metadata()

default_optional_transaction_index_metadata = sequential_id_metadata(
    field_name="Transaction index", required=False, load_default=None
)

# L1Handler.

payload_metadata = everest_fields.felt_as_hex_list_metadata

# Used in the CallL1Handler, to solve compatibility bug.
FromAddressEthAddressField = BackwardCompatibleIntAsHex(
    allow_decimal_loading=True,
    allow_bytes_hex_loading=False,
    allow_int_loading=True,
    required=True,
    validate=everest_fields.EthAddressIntField.validate,
)

from_address_field_metadata = dict(
    marshmallow_field=FromAddressEthAddressField, field_name="from_address"
)

# Contract address.

L2AddressField = RangeValidatedField(
    lower_bound=constants.L2_ADDRESS_LOWER_BOUND,
    upper_bound=constants.L2_ADDRESS_UPPER_BOUND,
    name="Contract address",
    error_code=StarknetErrorCode.OUT_OF_RANGE_CONTRACT_ADDRESS,
    formatter=hex,
)


contract_address_metadata = L2AddressField.metadata(field_name="contract address")

OptionalL2AddressField = OptionalField(
    field=dataclasses.replace(L2AddressField, name="L2 address"), none_probability=0
)
optional_l2_address_metadata = OptionalL2AddressField.metadata()

ContractAddressSalt = everest_fields.felt(name_in_error_message="Contract salt")
contract_address_salt_metadata = ContractAddressSalt.metadata()


# Class hash (as bytes).


def validate_class_hash(class_hash: bytes):
    value = from_bytes(value=class_hash, byte_order="big")
    ClassHashIntField.validate(value=value)


ClassHashField = BytesAsHex(required=True, validate=validate_class_hash)

class_hash_metadata = dict(marshmallow_field=ClassHashField)

non_required_class_hash_metadata = dict(
    marshmallow_field=BytesAsHex(required=False, validate=validate_class_hash),
)


# Class hash (as integer).


ClassHashIntField = RangeValidatedField(
    lower_bound=0,
    upper_bound=constants.CLASS_HASH_UPPER_BOUND,
    name="class_hash",
    error_code=StarknetErrorCode.OUT_OF_RANGE_CLASS_HASH,
    formatter=hex,
)


# Class hash.


NewClassHashField = BackwardCompatibleIntAsHex(
    allow_decimal_loading=False,
    allow_bytes_hex_loading=True,
    required=True,
    validate=ClassHashIntField.validate,
)


new_class_hash_metadata = dict(marshmallow_field=NewClassHashField)


address_to_class_hash_metadata = dict(
    marshmallow_field=mfields.Dict(
        keys=L2AddressField.get_marshmallow_field(), values=NewClassHashField
    )
)

address_to_timestamp_metadata = dict(
    marshmallow_field=FrozenDictField(
        keys=L2AddressField.get_marshmallow_field(),
        values=StrictRequiredInteger(validate=validate_non_negative("timestamp")),
    ),
)


def validate_optional_new_class_hash(class_hash: Optional[int]):
    if class_hash is not None:
        ClassHashIntField.validate(class_hash)


OptionalNewClassHashField = BackwardCompatibleIntAsHex(
    allow_decimal_loading=False,
    allow_bytes_hex_loading=True,
    required=False,
    load_default=None,
    validate=validate_optional_new_class_hash,
)

optional_new_class_hash_metadata = dict(marshmallow_field=OptionalNewClassHashField)


# Compiled Class hash.


CompiledClassHashField = RangeValidatedField(
    lower_bound=0,
    upper_bound=constants.COMPILED_CLASS_HASH_UPPER_BOUND,
    name="compiled_class_hash",
    error_code=StarknetErrorCode.OUT_OF_RANGE_COMPILED_CLASS_HASH,
    formatter=hex,
)
compiled_class_hash_metadata = CompiledClassHashField.metadata()

OptionalCompiledClassHashField = OptionalField(field=CompiledClassHashField, none_probability=0)
optional_compiled_class_hash_metadata = OptionalCompiledClassHashField.metadata()

sierra_program_size_metadata = dict(
    marshmallow_field=mfields.Integer(required=False, load_default=0)
)
abi_size_metadata = dict(marshmallow_field=mfields.Integer(required=False, load_default=0))


class NestedIntListField(mfields.Field):
    """
    Represents a nested list of integers.
    E.g., [0, [1, 2], [3, [4]]].
    """

    default_error_messages = {
        "invalid": "Expected an integer in NestedIntList field. Found {input_type}.",
    }

    def _serialize(self, value, attr, obj, **kwargs):
        return value

    def _deserialize(self, value, attr, data, **kwargs):
        # Recursively validate the nested list.
        def validate(inner_value):
            if isinstance(inner_value, list):
                for item in inner_value:
                    validate(item)
            elif not isinstance(inner_value, int):
                raise self.make_error("invalid", input_type=type(inner_value).__name__)

        validate(inner_value=value)
        return value


# Entry point.

EntryPointSelectorField = RangeValidatedField(
    lower_bound=constants.ENTRY_POINT_SELECTOR_LOWER_BOUND,
    upper_bound=constants.ENTRY_POINT_SELECTOR_UPPER_BOUND,
    name="Entry point selector",
    error_code=StarknetErrorCode.OUT_OF_RANGE_ENTRY_POINT_SELECTOR,
    formatter=hex,
)
entry_point_selector_metadata = EntryPointSelectorField.metadata()

OptionalEntryPointSelectorField = OptionalField(field=EntryPointSelectorField, none_probability=0)
optional_entry_point_selector_metadata = OptionalEntryPointSelectorField.metadata()

EntryPointOffsetField = RangeValidatedField(
    lower_bound=constants.ENTRY_POINT_OFFSET_LOWER_BOUND,
    upper_bound=constants.ENTRY_POINT_OFFSET_UPPER_BOUND,
    name="Entry point offset",
    error_code=StarknetErrorCode.OUT_OF_RANGE_ENTRY_POINT_OFFSET,
    formatter=None,
)
entry_point_offset_metadata = EntryPointOffsetField.metadata()

EntryPointFunctionIdxField = RangeValidatedField(
    lower_bound=constants.ENTRY_POINT_FUNCTION_IDX_LOWER_BOUND,
    upper_bound=constants.ENTRY_POINT_FUNCTION_IDX_UPPER_BOUND,
    name="Entry point function_idx",
    error_code=StarknetErrorCode.OUT_OF_RANGE_ENTRY_POINT_FUNCTION_IDX,
    formatter=None,
)
entry_point_function_idx_metadata = EntryPointFunctionIdxField.metadata()

# Fee.

FeeField = RangeValidatedField(
    lower_bound=constants.FEE_LOWER_BOUND,
    upper_bound=constants.FEE_UPPER_BOUND,
    name="Fee",
    error_code=StarknetErrorCode.OUT_OF_RANGE_FEE,
    formatter=hex,
)
fee_metadata = FeeField.metadata(required=False, load_default=0)

OptionalFeeField = OptionalField(field=FeeField, none_probability=0)
optional_fee_metadata = OptionalFeeField.metadata()

TipField = RangeValidatedField(
    lower_bound=constants.TIP_LOWER_BOUND,
    upper_bound=constants.TIP_UPPER_BOUND,
    name="Tip",
    error_code=StarknetErrorCode.OUT_OF_RANGE_TIP,
    formatter=hex,
)
tip_metadata = TipField.metadata(required=True)

MaxAmountField = RangeValidatedField(
    lower_bound=constants.MAX_AMOUNT_LOWER_BOUND,
    upper_bound=constants.MAX_AMOUNT_UPPER_BOUND,
    name="Max amount",
    error_code=StarknetErrorCode.OUT_OF_RANGE_MAX_AMOUNT,
    formatter=hex,
)
max_amount_metadata = MaxAmountField.metadata()

MaxPricePerUnitField = RangeValidatedField(
    lower_bound=constants.MAX_PRICE_PER_UNIT_LOWER_BOUND,
    upper_bound=constants.MAX_PRICE_PER_UNIT_UPPER_BOUND,
    name="Max amount",
    error_code=StarknetErrorCode.OUT_OF_RANGE_MAX_PRICE_PER_UNIT,
    formatter=hex,
)
max_price_per_unit_metadata = MaxPricePerUnitField.metadata()


class Resource(Enum):
    L1_GAS = from_bytes(b"L1_GAS")
    L2_GAS = from_bytes(b"L2_GAS")


@marshmallow_dataclass.dataclass(frozen=True)
class ResourceBounds(ValidatedMarshmallowDataclass):
    # The maximum amount of the resource allowed for usage during the execution.
    max_amount: int = field(metadata=max_amount_metadata)
    # The maximum price the user is willing to pay for the resource unit.
    max_price_per_unit: int = field(metadata=max_price_per_unit_metadata)


ResourceBoundsMapping = Mapping[Resource, ResourceBounds]


def validate_resource_bounds(resource_bounds: ResourceBoundsMapping) -> bool:
    error_message_wrong_keys = (
        "Invalid resource bounds keys; Input's keys: {input}; Input keys must be {resources_set}."
    )
    error_message_wrong_bounds = (
        "Invalid resource bounds; Resource.L2_GAS input: {input}; L2_GAS values must be 0."
    )
    if resource_bounds.keys() != set(Resource):
        raise marshmallow.ValidationError(
            error_message_wrong_keys.format(
                input=list(resource_bounds.keys()), resources_set=list(set(Resource))
            )
        )

    l2_gas_bounds = resource_bounds[Resource.L2_GAS]
    if not (l2_gas_bounds.max_amount == l2_gas_bounds.max_price_per_unit == 0):
        raise marshmallow.ValidationError(error_message_wrong_bounds.format(input=l2_gas_bounds))

    return True


resource_bounds_mapping_metadata = dict(
    marshmallow_field=mfields.Dict(
        keys=EnumField(enum_cls=Resource),
        values=mfields.Nested(ResourceBounds.Schema),
        validate=validate_resource_bounds,
    )
)

account_deployment_data_metadata = felt_as_hex_bounded_list_metadata_empty_list

# Gas price.

GasPriceField = RangeValidatedField(
    lower_bound=constants.GAS_PRICE_LOWER_BOUND,
    upper_bound=constants.GAS_PRICE_UPPER_BOUND,
    name="Gas price",
    error_code=StarknetErrorCode.OUT_OF_RANGE_GAS_PRICE,
    formatter=hex,
)
gas_price_metadata = GasPriceField.metadata(required=False, load_default=0)


# Transaction version.

TransactionVersionField = RangeValidatedField(
    lower_bound=constants.TRANSACTION_VERSION_LOWER_BOUND,
    upper_bound=constants.TRANSACTION_VERSION_UPPER_BOUND,
    name="Transaction version",
    error_code=StarknetErrorCode.OUT_OF_RANGE_TRANSACTION_VERSION,
    formatter=hex,
)
non_required_tx_version_metadata = TransactionVersionField.metadata(required=False, load_default=0)

tx_version_metadata = TransactionVersionField.metadata()


# State root.

backward_compatible_state_root_metadata = dict(
    marshmallow_field=BackwardCompatibleIntAsHex(required=True, allow_bytes_hex_loading=True)
)
backward_compatible_optional_state_root_metadata = dict(
    marshmallow_field=BackwardCompatibleIntAsHex(
        required=False, allow_bytes_hex_loading=True, allow_none=True, load_default=None
    )
)


optional_state_diff_hash_metadata = dict(
    marshmallow_field=BytesAsHex(required=False, load_default=None)
)

# L1 da mode.

L1DaModeEnumField = EnumField(
    enum_cls=L1DaMode,
    required=False,
    load_default=L1DaMode.CALLDATA,
    allow_none=False,
)

l1_da_mode_enum_metadata = dict(marshmallow_field=L1DaModeEnumField)


# Declared contracts.

declared_contracts_metadata = dict(
    marshmallow_field=VariadicLengthTupleField(
        ClassHashIntField.get_marshmallow_field(),
        required=False,
        load_default=(),
    )
)


# Transaction hash.

TransactionHashField = RangeValidatedField(
    lower_bound=constants.TRANSACTION_HASH_LOWER_BOUND,
    upper_bound=constants.TRANSACTION_HASH_UPPER_BOUND,
    name="Transaction hash",
    error_code=StarknetErrorCode.OUT_OF_RANGE_TRANSACTION_HASH,
    formatter=hex,
)
transaction_hash_metadata = TransactionHashField.metadata()


# General config.

invoke_tx_n_steps_metadata = dict(
    marshmallow_field=StrictRequiredInteger(validate=validate_non_negative("invoke_tx_n_steps"))
)

validate_n_steps_metadata = dict(
    marshmallow_field=StrictRequiredInteger(validate=validate_non_negative("validate_n_steps"))
)

gas_price = dict(
    marshmallow_field=StrictRequiredInteger(validate=validate_non_negative("gas_price"))
)

eth_price_in_fri = dict(
    marshmallow_field=StrictRequiredInteger(validate=validate_positive("eth_price_in_fri"))
)

# ExecutionInfo.

name_to_resources_metadata = dict(
    marshmallow_field=FrozenDictField(
        keys=mfields.String(required=True),
        values=StrictRequiredInteger(validate=validate_non_negative("Resource value")),
        load_default=dict,
    )
)

optional_tx_type_metadata = dict(
    marshmallow_field=EnumField(
        enum_cls=TransactionType, required=False, load_default=None, allow_none=True
    )
)

revert_error_metadata = dict(
    marshmallow_field=mfields.String(required=False, load_default=None, allow_none=True)
)


# CallInfo.

felt_metadata = everest_fields.FeltField.metadata()
failure_flag_metadata = everest_fields.FeltField.metadata(
    field_name="failure_flag", required=False, load_default=0
)
gas_consumed_metadata = everest_fields.FeltField.metadata(
    field_name="gas_consumed", required=False, load_default=0
)


# Commitment info.

commitment_facts_metadata = dict(
    marshmallow_field=FrozenDictField(
        keys=everest_fields.FeltField.get_marshmallow_field(),
        values=VariadicLengthTupleField(everest_fields.FeltField.get_marshmallow_field()),
        load_default=dict,
    )
)

# ExecutionMode.
execution_mode_metadata = dict(marshmallow_field=EnumField(enum_cls=ExecutionMode, required=True))

# Data availability.

DataAvailabilityModeEnumField = EnumField(
    enum_cls=DataAvailabilityMode,
    required=False,
    load_default=DataAvailabilityMode.L1,
    allow_none=False,
)

data_availability_mode_enum_metadata = dict(marshmallow_field=DataAvailabilityModeEnumField)

DataAvailabilityModeField = RangeValidatedField(
    lower_bound=DataAvailabilityMode.L1.value,
    upper_bound=DataAvailabilityMode.L2.value + 1,
    name="Data availability mode",
    error_code=StarknetErrorCode.OUT_OF_RANGE_DATA_AVAILABILITY_MODE,
    formatter=None,
)
data_availability_mode_metadata = dict(
    marshmallow_field=DataAvailabilityModeField.get_marshmallow_field(
        validate=validate_equal(
            "Data availability mode", allowed_value=DataAvailabilityMode.L1.value
        ),
        required=True,
    ),
)

# State Diff.

NoncesField = mfields.Dict(
    keys=L2AddressField.get_marshmallow_field(),
    values=NonceField.get_marshmallow_field(),
    load_default=dict,
)

address_to_nonce_metadata = dict(
    marshmallow_field=NoncesField,
)

data_availability_mode_to_nonces_metadata = dict(
    marshmallow_field=mfields.Dict(
        keys=DataAvailabilityModeEnumField,
        values=NoncesField,
        load_default=dict,
    )
)

StorageUpdatesField = mfields.Dict(
    keys=L2AddressField.get_marshmallow_field(),
    values=mfields.Dict(
        keys=everest_fields.FeltField.get_marshmallow_field(),
        values=everest_fields.FeltField.get_marshmallow_field(),
    ),
)

storage_updates_metadata = dict(
    marshmallow_field=StorageUpdatesField,
)

data_availability_mode_to_storage_updates_metadata = dict(
    marshmallow_field=mfields.Dict(
        keys=DataAvailabilityModeEnumField,
        values=StorageUpdatesField,
        load_default=dict,
    )
)

state_diff_declared_classes_metadata = dict(
    marshmallow_field=mfields.Dict(
        keys=ClassHashIntField.get_marshmallow_field(),
        values=ClassHashIntField.get_marshmallow_field(),
    )
)


# State diff commitment.

state_diff_commitment_metadata = everest_fields.FeltField.metadata(
    field_name="state diff commitment", required=True
)

ec_signature_metadata = dict(
    marshmallow_field=mfields.Tuple(
        tuple_fields=(
            everest_fields.FeltField.get_marshmallow_field(),
            everest_fields.FeltField.get_marshmallow_field(),
        ),
        required=True,
    )
)

public_key_metadata = everest_fields.FeltField.metadata(field_name="public key", required=True)
